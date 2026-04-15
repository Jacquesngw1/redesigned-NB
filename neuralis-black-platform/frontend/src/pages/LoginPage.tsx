import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';

export interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, _password: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (email === 'test@test.com') {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }

      onLogin();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-testid="login-page">
      <h2>Welcome Back</h2>
      <p>Sign in to your Neuralis Black account</p>
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
    </div>
  );
}
