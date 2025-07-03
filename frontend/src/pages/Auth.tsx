import React from 'react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { login } = useAuth();

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" style={{display: 'block', marginBottom: '1rem'}} />
      <input type="password" placeholder="Password" style={{display: 'block', marginBottom: '1rem'}} />
      <button onClick={login}>Login</button>
      <div style={{marginTop: '2rem'}}>
        <h3>Multi-Factor Authentication</h3>
        <p>MFA setup and verification will appear here.</p>
      </div>
    </div>
  );
};

export default Auth; 