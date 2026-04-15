import { Job, JobHandler } from '../jobQueue';

export interface RedisWorkerConfig {
  redisUrl: string;
  concurrency: number;
  retryDelay: number;
}

export interface RedisMessage {
  channel: string;
  data: unknown;
}

export class RedisWorker {
  private config: RedisWorkerConfig;
  private connected: boolean = false;
  private handlers: Map<string, JobHandler> = new Map();
  private processedMessages: RedisMessage[] = [];

  constructor(config: RedisWorkerConfig) {
    if (!config.redisUrl) {
      throw new Error('Redis URL is required');
    }
    if (config.concurrency < 1) {
      throw new Error('Concurrency must be at least 1');
    }
    if (config.retryDelay < 0) {
      throw new Error('Retry delay must be non-negative');
    }
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      throw new Error('Already connected');
    }
    // Simulate connection
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  registerHandler(channel: string, handler: JobHandler): void {
    if (!channel) {
      throw new Error('Channel is required');
    }
    this.handlers.set(channel, handler);
  }

  async processMessage(message: RedisMessage): Promise<unknown> {
    if (!this.connected) {
      throw new Error('Not connected to Redis');
    }

    const handler = this.handlers.get(message.channel);
    if (!handler) {
      throw new Error(`No handler registered for channel: ${message.channel}`);
    }

    const job: Job = {
      id: `msg-${Date.now()}`,
      type: message.channel,
      payload: message.data,
      status: 'pending' as any,
      priority: 5 as any,
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await handler(job);
    this.processedMessages.push(message);
    return result;
  }

  getProcessedCount(): number {
    return this.processedMessages.length;
  }

  getConcurrency(): number {
    return this.config.concurrency;
  }

  getRetryDelay(): number {
    return this.config.retryDelay;
  }
}
