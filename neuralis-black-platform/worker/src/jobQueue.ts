import { v4 as uuidv4 } from 'uuid';

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20,
}

export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  error?: string;
  result?: unknown;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
}

export type JobHandler<T = unknown> = (job: Job<T>) => Promise<unknown>;

export class JobQueue {
  private queue: Job[] = [];
  private handlers: Map<string, JobHandler> = new Map();
  private processing = false;

  registerHandler<T>(jobType: string, handler: JobHandler<T>): void {
    if (!jobType) {
      throw new Error('Job type is required');
    }
    if (!handler) {
      throw new Error('Handler is required');
    }
    this.handlers.set(jobType, handler as JobHandler);
  }

  enqueue<T>(type: string, payload: T, options?: { priority?: JobPriority; maxAttempts?: number; scheduledAt?: Date }): Job<T> {
    if (!type) {
      throw new Error('Job type is required');
    }

    if (!this.handlers.has(type)) {
      throw new Error(`No handler registered for job type: ${type}`);
    }

    const now = new Date();
    const job: Job<T> = {
      id: uuidv4(),
      type,
      payload,
      status: JobStatus.PENDING,
      priority: options?.priority || JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: now,
      updatedAt: now,
      scheduledAt: options?.scheduledAt,
    };

    this.queue.push(job as Job);
    this.sortQueue();
    return job;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  getNextJob(): Job | null {
    const now = new Date();
    const index = this.queue.findIndex(
      (job) =>
        job.status === JobStatus.PENDING &&
        (!job.scheduledAt || job.scheduledAt <= now)
    );

    if (index === -1) {
      return null;
    }

    return this.queue[index];
  }

  async processNext(): Promise<Job | null> {
    const job = this.getNextJob();
    if (!job) {
      return null;
    }

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = JobStatus.FAILED;
      job.error = `No handler found for job type: ${job.type}`;
      job.updatedAt = new Date();
      return job;
    }

    job.status = JobStatus.PROCESSING;
    job.attempts++;
    job.updatedAt = new Date();

    try {
      const result = await handler(job);
      job.status = JobStatus.COMPLETED;
      job.result = result;
      job.updatedAt = new Date();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      job.error = errorMessage;

      if (job.attempts < job.maxAttempts) {
        job.status = JobStatus.RETRY;
        // Re-enqueue for retry by setting back to pending
        job.status = JobStatus.PENDING;
      } else {
        job.status = JobStatus.FAILED;
      }
      job.updatedAt = new Date();
    }

    return job;
  }

  async processAll(): Promise<Job[]> {
    const processed: Job[] = [];
    let job = await this.processNext();

    while (job) {
      processed.push(job);
      job = await this.processNext();
    }

    return processed;
  }

  getJobById(id: string): Job | undefined {
    return this.queue.find((job) => job.id === id);
  }

  getJobsByStatus(status: JobStatus): Job[] {
    return this.queue.filter((job) => job.status === status);
  }

  getQueueLength(): number {
    return this.queue.filter((job) => job.status === JobStatus.PENDING).length;
  }

  getTotalJobs(): number {
    return this.queue.length;
  }

  clearCompleted(): number {
    const before = this.queue.length;
    this.queue = this.queue.filter((job) => job.status !== JobStatus.COMPLETED);
    return before - this.queue.length;
  }

  clearAll(): void {
    this.queue = [];
  }
}
