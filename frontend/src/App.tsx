import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Docs from './pages/Docs';
import Learning from './pages/Learning';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Insights from './pages/Insights';
import Integrations from './pages/Integrations';
import Notifications from './pages/Notifications';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const MIN_WIDTH = 160;
const MAX_WIDTH = 340;
const DEFAULT_WIDTH = 220;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved === null ? true : saved === 'true';
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });

  const { isLoggedIn } = useAuth();
  console.log('isLoggedIn:', isLoggedIn);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);
  useEffect(() => {
    localStorage.setItem('sidebarWidth', String(sidebarWidth));
  }, [sidebarWidth]);
  useEffect(() => {
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      if (window.innerWidth >= 900 && sidebarOpen) {
        appLayout.setAttribute('style', `--sidebar-width: ${sidebarWidth}px`);
      } else {
        appLayout.setAttribute('style', '--sidebar-width: 0px');
      }
    }
  }, [sidebarOpen, sidebarWidth]);

  return (
    <AuthProvider>
      <div className="app-layout">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          width={sidebarWidth}
          setWidth={setSidebarWidth}
          minWidth={MIN_WIDTH}
          maxWidth={MAX_WIDTH}
        />
        <main className="main-content">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            {isLoggedIn ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/learning" element={<Learning />} />
                <Route path="/team" element={<Team />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/search" element={<Search />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
