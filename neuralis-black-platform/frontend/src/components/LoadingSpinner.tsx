import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 64,
};

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const px = sizeMap[size];

  return (
    <div className="loading-spinner" data-testid="loading-spinner" role="status">
      <div
        className="spinner"
        style={{ width: px, height: px }}
        data-testid="spinner-icon"
      />
      {message && <p data-testid="spinner-message">{message}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
