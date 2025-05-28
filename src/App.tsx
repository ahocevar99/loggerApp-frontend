import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './components/Dashboard';
import './styles/Dashboard.css'

const App: React.FC = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        authorizationParams: {
          screen_hint: 'login',
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return (
      <p className="loading-text" role="alert" aria-live="polite">
        <span className="spinner" aria-hidden="true"></span>
        Nalaganje...
      </p>
    );
  }

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default App;