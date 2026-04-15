import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  async getProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json({ data: project });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async getAllProjects(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await this.projectService.getAllProjects();
      res.json({ data: projects });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async getProjectsByOwner(req: Request, res: Response): Promise<void> {
    try {
      const { ownerId } = req.params;
      const projects = await this.projectService.getProjectsByOwner(ownerId);
      res.json({ data: projects });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(500).json({ error: message });
    }
  }

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, ownerId, tags } = req.body;

      if (!name || !ownerId) {
        res.status(400).json({ error: 'Name and ownerId are required' });
        return;
      }

      const project = await this.projectService.createProject({ name, description, ownerId, tags });
      res.status(201).json({ data: project });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message.includes('name') || message.includes('Owner')) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.updateProject(id, req.body);
      res.json({ data: project });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message === 'Project not found') {
        res.status(404).json({ error: message });
        return;
      }
      if (message.includes('name')) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message === 'Project not found') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }

  async archiveProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectService.archiveProject(id);
      res.json({ data: project });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal server error';
      if (message === 'Project not found') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
}
