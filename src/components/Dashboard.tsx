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
    getAccessTokenWithPopup,
  } = useAuth0();

  const [token, setToken] = useState<string | null>(null);
  const [content, setContent] = useState<JSX.Element | null>(null);
  const [loadingToken, setLoadingToken] = useState<boolean>(false);

  const handleGetToken = async () => {
    setLoadingToken(true);
    try {
      const accessToken = await getAccessTokenWithPopup({
        authorizationParams: {
          audience: 'https://logerApp/api',
          scope: 'read:projects write:projects',
        },
      });
      setToken(accessToken ?? null);
      setContent(<MyProjects token={accessToken ?? null} />);
    } catch (err) {
      console.error('Token error:', err);
    } finally {
      setLoadingToken(false);
    }
  };

  if (isLoading) {
    return <p className="flex items-center justify-center text-3xl m-auto">Nalaganje...</p>;
  }

  if (!isAuthenticated) return null;
  let isAdmin = false;

  if (isAuthenticated) {
    const roles = user && user['https://my-app.com/roles'];
    isAdmin = roles?.includes('Admin');
  }


  return (
    <div>
      <div className="absolute left-[2rem] top-[2rem]">
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          style={{
            backgroundColor: 'green',
            width: '15rem',
            height: '4rem',
            color: 'white',
            cursor: 'pointer',
            border: 0,
            boxShadow: '0 5px 7px rgba(0, 0, 0, 0.1)',
            borderRadius:"0.5rem"
          }}
        >
          {'< LOG OUT'}
        </button>
      </div>

      {!token ? (
        <div className="flex justify-center mt-[10rem]">
          <button
            onClick={handleGetToken}
            style={{padding:"1.1rem", cursor:"pointer", borderRadius:"2rem", fontSize:"1.3rem", boxShadow:'0 5px 7px rgba(0, 0, 0, 0.1)'}}
          >
            {loadingToken ? 'Pridobivanje dostopa...' : 'Pridobi dostop'}
          </button>
        </div>
      ) : (
        <>
          <nav className="border-1 border-solid mt-[2rem] flex flex-col w-[15rem] absolute left-[2rem] top-[6rem]">
            <button
              className="py-[1rem] px-[2rem] cursor-pointer"
              style={{ fontSize: '1.5rem' }}
              onClick={() => setContent(<AddProject token={token} />)}
            >
              +
            </button>
            <p
              className="p-[2rem] cursor-pointer m-auto flex"
              onClick={() => setContent(<MyProjects token={token} />)}
            >
              Moji projekti
            </p>
            <p
              className="p-[2rem] cursor-pointer m-auto flex"
              onClick={() => setContent(<AllProjects token={token} />)}
            >
              Vsi projekti
            </p>
            {isAdmin && (
              <p
              className="p-[2rem] cursor-pointer m-auto flex"
              onClick={() => setContent(<AddUser token={token} />)}
            >
              Dodaj uporabnika
            </p>
            )}
          </nav>
          <div className="mt-[3rem] w-[90%] ml-[5%]">{content}</div>
        </>
      )}
    </div>
  );
};

export default Home;
