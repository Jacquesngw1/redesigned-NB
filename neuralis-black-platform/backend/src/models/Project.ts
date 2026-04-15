export interface IProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
}

export interface CreateProjectInput {
  name: string;
  description: string;
  ownerId: string;
  tags?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  tags?: string[];
}

export function validateProjectName(name: string): { valid: boolean; message: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Project name is required' };
  }
  if (name.length > 100) {
    return { valid: false, message: 'Project name must be 100 characters or less' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { valid: false, message: 'Project name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  return { valid: true, message: 'Project name is valid' };
}

export function filterProjectsByStatus(projects: IProject[], status: ProjectStatus): IProject[] {
  return projects.filter((p) => p.status === status);
}

export function sortProjectsByDate(projects: IProject[], order: 'asc' | 'desc' = 'desc'): IProject[] {
  return [...projects].sort((a, b) => {
    const diff = a.createdAt.getTime() - b.createdAt.getTime();
    return order === 'asc' ? diff : -diff;
  });
}
