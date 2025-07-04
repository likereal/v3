import React, { useState } from 'react';
import { signup, login } from '../utils/auth';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
        alert('Logged in!');
      } else {
        await signup(email, password);
        alert('Signed up!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      <p onClick={() => setIsLogin(!isLogin)} style={{cursor: 'pointer', color: 'blue'}}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </p>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}