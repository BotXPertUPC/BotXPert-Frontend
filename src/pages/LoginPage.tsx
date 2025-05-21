import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterPassword } from '../context/MasterPasswordContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authenticate } = useMasterPassword();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(password)) {
      navigate('/main');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container" onClick={() => navigate('/')} style={{ transform: 'scale(1.4)' }}>
          <img
            src="/logo512.png"
            alt="BotXpert White Name Logo"
            className="logo-image"
          />
        </div>
        <div className="spacer" style={{ height: '15px' }}></div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            placeholder="Master Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;