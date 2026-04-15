import { v4 as uuidv4 } from 'uuid';
import {
  IProject,
  ProjectStatus,
  CreateProjectInput,
  UpdateProjectInput,
  validateProjectName,
} from '../models/Project';

export interface ProjectRepository {
  findById(id: string): Promise<IProject | null>;
  findByOwnerId(ownerId: string): Promise<IProject[]>;
  findAll(): Promise<IProject[]>;
  create(project: IProject): Promise<IProject>;
  update(id: string, data: Partial<IProject>): Promise<IProject | null>;
  delete(id: string): Promise<boolean>;
}

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async getProjectById(id: string): Promise<IProject | null> {
    if (!id) {
      throw new Error('Project ID is required');
    }
    return this.repository.findById(id);
  }

  async getProjectsByOwner(ownerId: string): Promise<IProject[]> {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }
    return this.repository.findByOwnerId(ownerId);
  }

  async getAllProjects(): Promise<IProject[]> {
    return this.repository.findAll();
  }

  async createProject(input: CreateProjectInput): Promise<IProject> {
    const nameValidation = validateProjectName(input.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.message);
    }

    if (!input.ownerId) {
      throw new Error('Owner ID is required');
    }

    const now = new Date();
    const project: IProject = {
      id: uuidv4(),
      name: input.name.trim(),
      description: input.description?.trim() || '',
      ownerId: input.ownerId,
      status: ProjectStatus.DRAFT,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(project);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<IProject> {
    const existingProject = await this.repository.findById(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    if (input.name) {
      const nameValidation = validateProjectName(input.name);
      if (!nameValidation.valid) {
        throw new Error(nameValidation.message);
      }
    }

    const updateData: Partial<IProject> = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.name) {
      updateData.name = input.name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }

    const updatedProject = await this.repository.update(id, updateData);
    if (!updatedProject) {
      throw new Error('Failed to update project');
    }

    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const existingProject = await this.repository.findById(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }
    return this.repository.delete(id);
  }

  async archiveProject(id: string): Promise<IProject> {
    return this.updateProject(id, { status: ProjectStatus.ARCHIVED });
  }

  async activateProject(id: string): Promise<IProject> {
    return this.updateProject(id, { status: ProjectStatus.ACTIVE });
  }
}
