import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';

export type Page = 'login' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Neuralis Black</h1>
        {isAuthenticated && (
          <button onClick={handleLogout} data-testid="logout-button">
            Logout
          </button>
        )}
      </header>
      <main>
        {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
        {currentPage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;
