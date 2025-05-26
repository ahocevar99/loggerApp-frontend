import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './components/Dashboard';

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

  if (isLoading) return <p className='flex items-center justify-center text-3xl m-auto text-green-500'>Nalaganje...</p>;

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default App;