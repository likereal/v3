import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="profile-root">
      <header className="profile-header">
        <div className="profile-pic-container">
          <img className="profile-pic" src="/logo192.png" alt="Project Logo" />
        </div>
        <div className="profile-info">
          <div className="profile-title-row">
            <span className="profile-name">DevFlowHub</span>
            <span className="profile-badge">✔</span>
            <button className="profile-action">Join</button>
            <button className="profile-action">Message</button>
            <button className="profile-action">...</button>
          </div>
          <div className="profile-stats">
            <span><b>42</b> projects</span>
            <span><b>128</b> team members</span>
            <span><b>8</b> integrations</span>
          </div>
          <div className="profile-bio">
            <span>DevFlowHub</span>
            <span>Unifying developer productivity. 🚀</span>
            <span>devflowhub.com/support</span>
          </div>
        </div>
      </header>
      <section className="profile-highlights">
        <div className="highlight">
          <div className="highlight-circle">D</div>
          <span>Docs</span>
        </div>
        <div className="highlight">
          <div className="highlight-circle">J</div>
          <span>Jira</span>
        </div>
        <div className="highlight">
          <div className="highlight-circle">G</div>
          <span>GitHub</span>
        </div>
        <div className="highlight">
          <div className="highlight-circle">L</div>
          <span>Learning</span>
        </div>
      </section>
      <nav className="profile-bottom-nav">
        <span className="nav-item active">Overview</span>
        <span className="nav-item">Tasks</span>
        <span className="nav-item">Docs</span>
        <span className="nav-item">Team</span>
      </nav>
    </div>
  );
};

export default Profile; 