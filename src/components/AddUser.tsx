import React, { useState } from 'react';
import '../styles/AddUser.css'
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
    <div className="add-user-container">
      <h3 className="title">Dodaj uporabnika</h3>

      <div className="form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Uporabniško ime:</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Geslo:</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {message && (
          <div className="message-container">
            <div></div>
            <div className="alert">{message.text}</div>
          </div>
        )}
        <button
          type="submit"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Dodajanje...' : 'Dodaj'}
        </button>
      </div>
    </div>
  );


};

export default AddUser;
