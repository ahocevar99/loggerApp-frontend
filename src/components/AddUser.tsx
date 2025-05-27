import React, { useState } from 'react';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AddUserProps {
  token: string;
}

const AddUser: React.FC<AddUserProps> = ({ token }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setMessage({ type: 'error', text: 'E-pošta, uporabniško ime in geslo so obvezni.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${backendUrl}/api/addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, username, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.message || 'Napaka pri ustvarjanju uporabnika.');
      }

      setMessage({ type: 'success', text: 'Uporabnik uspešno dodan!' });
      setEmail('');
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-auto mt-[2rem] flex flex-col justify-center items-center">
      <h3 className="mb-[5rem] p-[0.5rem] font-semibold text-xl">Dodaj uporabnika</h3>

      <div className="grid grid-cols-[10rem_1fr] gap-y-[1rem] gap-x-[5rem] ml-[2rem]">
        <label>Email:</label>
        <input
          type="email"
          className="py-[0.3rem] w-[20rem]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Uporabniško ime:</label>
        <input
          type="text"
          className="py-[0.3rem] w-[20rem]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Geslo:</label>
        <input
          type="password"
          className="py-[0.3rem] w-[20rem]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div></div>
        <button
          type="submit"
          className="w-[5rem] h-[2rem] cursor-pointer"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Dodajanje...' : 'Dodaj'}
        </button>
      </div>
      {message && (
        <div className="flex flex-row mt-[2rem] justify-center items-center m-auto">
          <div></div>
          <div className="italic">{message.text}</div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
