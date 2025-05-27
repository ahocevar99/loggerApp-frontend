import React, { useState, type JSX } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MyProjects from './MyProjects';
import AllProjects from './AllProjects';
import AddProject from './AddProject';
import AddUser from './AddUser';

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
    } catch (silentError) {
      console.warn('Silent token fetch failed, trying popup...', silentError);
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
    return <p className="flex items-center justify-center text-3xl m-auto">Nalaganje...</p>;
  }

  if (!isAuthenticated) return null;

  const roles = user && user['https://my-app.com/roles'];
  const isAdmin = roles?.includes('Admin');

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '2rem',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <button
          onClick={() => token && setContent(<AddProject token={token} />)}
          style={{
            fontSize: '1.5rem',
            cursor: 'pointer',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            width: "8rem",
            height: "4rem"
          }}
        >
          +
        </button>

        <nav
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            fontSize: '1.2rem',
            fontWeight: '500',
          }}
        >
          <p className="cursor-pointer" onClick={() => setContent(<MyProjects token={token} />)}>
            Moji projekti
          </p>
          <p className="cursor-pointer" onClick={() => setContent(<AllProjects token={token} />)}>
            Vsi projekti
          </p>
          {isAdmin && (
            <p className="cursor-pointer" onClick={() => token && setContent(<AddUser token={token} />)}>
              Dodaj uporabnika
            </p>
          )}
        </nav>

        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          style={{
            backgroundColor: 'green',
            color: 'white',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '0.5rem',
            boxShadow: '0 5px 7px rgba(0, 0, 0, 0.1)',
            width: "8rem",
            height: "4rem"
          }}
        >
          {'< LOG OUT'}
        </button>
      </div>

      {!token ? (
        <div className="flex justify-center mt-[10rem]">
          <button
            onClick={handleGetToken}
            style={{
              padding: "1.1rem",
              cursor: "pointer",
              borderRadius: "2rem",
              fontSize: "1.3rem",
              boxShadow: '0 5px 7px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loadingToken ? 'Pridobivanje dostopa...' : 'Pridobi dostop'}
          </button>
        </div>
      ) : (
        <>
          {user && (
            <div className="text-center pt-[1rem] mt-[1rem] text-gray-700 text-lg">
              Prijavljen si kot: <span className="font-semibold italic">{user.name}</span>
            </div>
          )}
          <div className="mt-[3rem] w-[90%] justify-center flex flex-row items-center m-auto">
            {content}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
