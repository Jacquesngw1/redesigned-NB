import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
}

const mockProjects: Project[] = [
  { id: '1', name: 'Neural Engine', description: 'Core ML pipeline', status: 'active', tags: ['ml', 'python'] },
  { id: '2', name: 'Data Ingestion', description: 'Data processing service', status: 'active', tags: ['data', 'etl'] },
  { id: '3', name: 'Legacy API', description: 'Deprecated API gateway', status: 'archived', tags: ['api'] },
];

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter);

  const handleArchive = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'archived' as const } : p))
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <div className="dashboard" data-testid="dashboard">
      <h2>Projects</h2>
      <div className="filters" data-testid="filter-bar">
        {['all', 'active', 'archived', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            className={filter === f ? 'active' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="project-list" data-testid="project-list">
        {filteredProjects.length === 0 ? (
          <p data-testid="no-projects">No projects found</p>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onArchive={handleArchive}
            />
          ))
        )}
      </div>
    </div>
  );
}
