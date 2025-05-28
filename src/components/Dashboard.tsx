import React, { useState, type JSX } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MyProjects from './MyProjects';
import AllProjects from './AllProjects';
import AddProject from './AddProject';
import AddUser from './AddUser';
import '../styles/Dashboard.css';

const Home: React.FC = () => {
  const {
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    getAccessTokenWithPopup,
  } = useAuth0();

  const [token, setToken] = useState<string | null>(null);
  const [content, setContent] = useState<JSX.Element | null>(null);
  const [loadingToken, setLoadingToken] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const handleGetToken = async () => {
    setLoadingToken(true);
    try {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://logerApp/api',
          scope: 'read:projects write:projects',
        },
      });
      setToken(accessToken ?? null);
      setContent(<MyProjects token={accessToken ?? null} />);
    } catch {
      try {
        const accessToken = await getAccessTokenWithPopup({
          authorizationParams: {
            audience: 'https://logerApp/api',
            scope: 'read:projects write:projects',
          },
        });
        setToken(accessToken ?? null);
        setContent(<MyProjects token={accessToken ?? null} />);
      } catch (popupError) {
        console.error('Popup token error:', popupError);
      }
    } finally {
      setLoadingToken(false);
    }
  };

  if (isLoading) {
    return (
      <p className="loading-text" role="alert" aria-live="polite">
        <span className="spinner" aria-hidden="true"></span>
        Nalaganje...
      </p>
    );
  }

  if (!isAuthenticated) return null;

  const roles = user && user['https://my-app.com/roles'];
  const isAdmin = roles?.includes('Admin');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleMenuClick = (element: JSX.Element | null) => {
    setContent(element);
    setMenuOpen(false);
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <button
          className="btn add-project"
          onClick={() => token && setContent(<AddProject token={token} />)}
          aria-label="Dodaj projekt"
        >
          +
        </button>

        <button
          className="btn hamburger-menu"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          &#9776;
        </button>

        <div className={`nav-items ${menuOpen ? 'open' : ''}`}>
          <p onClick={() => handleMenuClick(<MyProjects token={token} />)}>Moji projekti</p>
          <p onClick={() => handleMenuClick(<AllProjects token={token} />)}>Vsi projekti</p>
          {isAdmin && (
            <p onClick={() => token && handleMenuClick(<AddUser token={token} />)}>Dodaj uporabnika</p>
          )}
        </div>

        <button
          className="btn logout"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          aria-label="Odjava"
        >
          {'< LOG OUT'}
        </button>
      </nav>

      {!token ? (
        <div className="token-button-wrapper">
          <button
            onClick={handleGetToken}
            className="btn token-button"
            disabled={loadingToken}
          >
            {loadingToken ? 'Pridobivanje dostopa...' : 'Pridobi dostop'}
          </button>
        </div>
      ) : (
        <>
          {user && (
            <div className="logged-user">
              <p>Prijavljen si kot:</p>
              <span>{user.name}</span>
            </div>
          )}
          <div className="dashboard-content">{content}</div>
        </>
      )}
    </div>
  );
};

export default Home;
