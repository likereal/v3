import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Docs from './pages/Docs';
import Learning from './pages/Learning';
import Team from './pages/Team';
import Settings from './pages/Settings';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/docs">Docs</Link></li>
          <li><Link to="/learning">Learning</Link></li>
          <li><Link to="/team">Team</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
