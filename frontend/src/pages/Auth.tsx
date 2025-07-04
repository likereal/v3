import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../context/AuthContext';
import { signup, login, signInWithGoogle } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import './Auth.css';


  

const Auth: React.FC = () => {
  const { user, loading, error, login, loginWithGoogle, logout, connectGithub, connectJira, disconnectGithub, disconnectJira, fetchJiraUserInfo, userInfo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button 
            className="auth-back-button"
            onClick={handleBackToWelcome}
          >
            ← Back to Welcome
          </button>
          <img src="/logo192.png" alt="DevFlowHub Logo" className="auth-logo" />
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to continue to DevFlowHub' : 'Join DevFlowHub to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="auth-google-button"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button"
              className="auth-switch-button"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
          
          
          
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
    } catch (e: any) {
      setLocalError(e.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setLocalError(e.message);
    }
  };

  useEffect(() => {
    if (user) fetchJiraUserInfo();
  }, [user]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;

  if (user) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', background: '#232946', color: '#fff', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 12px #0002' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Welcome!</h2>
        <p style={{ textAlign: 'center', marginBottom: 24 }}>You are logged in as <b>{user.email}</b></p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* GitHub Section */}
          <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16 }}>
            <h3 style={{ color: '#eebbc3', marginTop: 0, marginBottom: 16 }}>GitHub</h3>
            {userInfo?.github ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div><b>Connected as:</b> {userInfo.github.login || userInfo.name}</div>
                  {userInfo.github.avatar_url && (
                    <img src={userInfo.github.avatar_url} alt="GitHub avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginTop: 8 }} />
                  )}
                </div>
                <button 
                  onClick={disconnectGithub} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5em 1em', 
                    borderRadius: 6, 
                    background: '#dc3545', 
                    color: '#fff', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Disconnect GitHub
                </button>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 16, fontSize: '0.9em', color: '#b8c1ec' }}>Connect your GitHub account to access repositories and issues</p>
                <button 
                  onClick={connectGithub} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5em 1em', 
                    borderRadius: 6, 
                    background: '#181818', 
                    color: '#eebbc3', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Connect GitHub
                </button>
              </>
            )}
          </div>

          {/* Jira Section */}
          <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 16 }}>
            <h3 style={{ color: '#eebbc3', marginTop: 0, marginBottom: 16 }}>Jira</h3>
            {userInfo?.jira ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div><b>Connected as:</b> {userInfo.jira.displayName || userInfo.jira.name}</div>
                  <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>{userInfo.jira.email}</div>
                </div>
                <button 
                  onClick={disconnectJira} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5em 1em', 
                    borderRadius: 6, 
                    background: '#dc3545', 
                    color: '#fff', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Disconnect Jira
                </button>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 16, fontSize: '0.9em', color: '#b8c1ec' }}>Connect your Jira account to access projects and issues</p>
                <button 
                  onClick={connectJira} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5em 1em', 
                    borderRadius: 6, 
                    background: '#181818', 
                    color: '#eebbc3', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Connect Jira
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={logout} 
            style={{ 
              padding: '0.7em 2em', 
              borderRadius: 8, 
              background: '#eebbc3', 
              color: '#232946', 
              fontWeight: 600, 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Logout from All Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', background: '#232946', color: '#fff', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 12px #0002' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.7em', borderRadius: 6, border: '1px solid #444', marginTop: 4, background: '#181818', color: '#fff' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.7em', borderRadius: 6, border: '1px solid #444', marginTop: 4, background: '#181818', color: '#fff' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.7em', borderRadius: 8, background: '#eebbc3', color: '#232946', fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <button onClick={loginWithGoogle} style={{ width: '100%', padding: '0.7em', borderRadius: 8, background: '#4285F4', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 12 }}>
        Continue with Google
      </button>
      {(error || localError) && <div style={{ color: 'red', marginBottom: 8 }}>{error || localError}</div>}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        {mode === 'login' ? (
          <span>Don&apos;t have an account? <button style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setMode('register')}>Register</button></span>
        ) : (
          <span>Already have an account? <button style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setMode('login')}>Login</button></span>

        )}
      </div>
    </div>
  );
};

export default Auth;