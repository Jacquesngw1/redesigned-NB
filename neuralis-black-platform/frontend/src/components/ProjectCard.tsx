import React from 'react';

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived' | 'draft';
  tags: string[];
  onSelect?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function ProjectCard({ id, name, description, status, tags, onSelect, onArchive }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    active: '#4caf50',
    archived: '#9e9e9e',
    draft: '#ff9800',
  };

  return (
    <div className="project-card" data-testid={`project-card-${id}`}>
      <div className="project-header">
        <h3 data-testid="project-name">{name}</h3>
        <span
          className="status-badge"
          data-testid="project-status"
          style={{ backgroundColor: statusColors[status] || '#ccc' }}
        >
          {status}
        </span>
      </div>
      <p data-testid="project-description">{description}</p>
      {tags.length > 0 && (
        <div className="tags" data-testid="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag" data-testid={`tag-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="actions">
        {onSelect && (
          <button onClick={() => onSelect(id)} data-testid="select-button">
            View
          </button>
        )}
        {onArchive && status !== 'archived' && (
          <button onClick={() => onArchive(id)} data-testid="archive-button">
            Archive
          </button>
        )}
      </div>
    </div>
  );
}
