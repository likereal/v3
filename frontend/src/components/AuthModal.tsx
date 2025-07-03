import React from 'react';

const AuthModal: React.FC = () => (
  <div style={{background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
    <h2>Login</h2>
    <input type="text" placeholder="Username" style={{display: 'block', marginBottom: '1rem'}} />
    <input type="password" placeholder="Password" style={{display: 'block', marginBottom: '1rem'}} />
    <button>Login</button>
    <div style={{marginTop: '2rem'}}>
      <h3>MFA</h3>
      <p>MFA setup/verification UI here.</p>
    </div>
  </div>
);

export default AuthModal; 