import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/docs">Docs</Link></li>
          <li><Link to="/learning">Learning</Link></li>
          <li><Link to="/team">Team</Link></li>
          <li><Link to="/insights">Insights</Link></li>
          <li><Link to="/search">Search</Link></li>
          <li><Link to="/integrations">Integrations</Link></li>
          <li><Link to="/notifications">Notifications</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/auth">Auth</Link></li>
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/team" element={<Team />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/search" element={<Search />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
