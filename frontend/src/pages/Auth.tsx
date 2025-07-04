import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { user, loading, error, login, loginWithGoogle, logout, connectGithub, connectJira, disconnectGithub, disconnectJira, fetchJiraUserInfo, userInfo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [localError, setLocalError] = useState<string | null>(null);

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
      <div className="welcome-gradient-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 600, width: '100%', color: '#fff', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 12px #0002', background: 'rgba(35,41,70,0.95)' }}>
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
      </div>
    );
  }

  return (
    <div className="welcome-gradient-bg" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '2rem' }}>
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
          <button type="submit" className="MuiButton-root" style={{ width: '100%', marginBottom: 12 }}>
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button onClick={loginWithGoogle} className="MuiButton-root" style={{ width: '100%', background: '#4285F4', color: '#fff', marginBottom: 12 }}>
          Continue with Google
        </button>
        {(error || localError) && <div style={{ color: 'red', marginBottom: 8 }}>{error || localError}</div>}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {mode === 'login' ? (
            <span>Don&apos;t have an account? <button className="MuiButton-root" style={{ background: 'none', color: '#fff', border: 'none', cursor: 'pointer', textDecoration: 'underline', boxShadow: 'none' }} onClick={() => setMode('register')}>Register</button></span>
          ) : (
            <span>Already have an account? <button className="MuiButton-root" style={{ background: 'none', color: '#fff', border: 'none', cursor: 'pointer', textDecoration: 'underline', boxShadow: 'none' }} onClick={() => setMode('login')}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 