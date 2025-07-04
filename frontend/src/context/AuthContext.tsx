import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { auth } from '../firebase'; // Make sure this is the correct path
import { onAuthStateChanged, User } from 'firebase/auth';


  

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

const firebaseConfig = {
  apiKey: "AIzaSyAqANbin2gYYBdPd7W3CTWIkgHifTdecI4",
  authDomain: "v3hackathon.firebaseapp.com",
  projectId: "v3hackathon",
  storageBucket: "v3hackathon.firebasestorage.app",
  messagingSenderId: "1013378445529",
  appId: "1:1013378445529:web:4bd5e30a68aa4e226b4ec8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export type UserInfo = {
  uid: string;
  email: string;
  name?: string;
  avatar?: string;
  github?: any;
  jira?: any;
};

type AuthContextType = {
  isLoggedIn: boolean;

  user: User | null;
  userInfo: UserInfo | null;
  idToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  connectGithub: () => void;
  connectJira: () => void;
  disconnectGithub: () => Promise<void>;
  disconnectJira: () => Promise<void>;
  fetchJiraUserInfo: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;

};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const login = () => {};  // Not needed, handled by Firebase
  const logout = () => { auth.signOut(); };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
        await fetchUserInfo(token);
        // Restore OAuth session on backend
        await axios.post('http://localhost:5000/auth/restore', {}, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        // --- NEW: Refresh user info after OAuth redirect ---
        if (window.location.search.includes('github')) {
          await fetchUserInfo(token); // or refreshUserInfo()
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setIdToken(null);
        setUserInfo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await axios.get('/api/user', {
        baseURL: 'http://localhost:5000',
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      const data = res.data as any;
      if (data && typeof data === 'object' && data.email) {
        setUserInfo({ ...data, uid: user?.uid || '' } as UserInfo);
      } else {
        setUserInfo(null);
      }
    } catch (e: any) {
      setUserInfo(null);
    }
  };

  const refreshUserInfo = async () => {
    if (idToken) await fetchUserInfo(idToken);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!window.confirm('Are you sure you want to log out from all services?')) return;
    setError(null);
    setLoading(true);
    try {
      // Log out from backend (GitHub)
      await axios.get('http://localhost:5000/auth/logout', { withCredentials: true });
      await signOut(auth);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = () => {
    if (!idToken) return;
    window.location.href = `http://localhost:5000/auth/github?state=${idToken}`;
  };

  const connectJira = () => {
    if (!idToken) return;
    window.location.href = `http://localhost:5000/auth/jira?state=${idToken}`;
  };

  const fetchJiraUserInfo = async () => {
    if (!idToken) return;
    try {
      const res = await axios.get('http://localhost:5000/api/jira/user', {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      });
      setUserInfo(prev => prev ? { ...prev, jira: res.data } : prev);
    } catch (e) {
      // ignore
    }
  };

  const disconnectGithub = async () => {
    if (!idToken) return;
    try {
      await axios.post('http://localhost:5000/auth/disconnect/github', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      });
      await refreshUserInfo();
    } catch (e) {
      console.error('Failed to disconnect GitHub:', e);
    }
  };

  const disconnectJira = async () => {
    if (!idToken) return;
    try {
      await axios.post('http://localhost:5000/auth/disconnect/jira', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      });
      await refreshUserInfo();
    } catch (e) {
      console.error('Failed to disconnect Jira:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userInfo, idToken, loading, error, login, loginWithGoogle, logout, connectGithub, connectJira, disconnectGithub, disconnectJira, fetchJiraUserInfo, refreshUserInfo }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 