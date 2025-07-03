import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <img src="/logo192.png" alt="DevFlowHub Logo" className="welcome-logo" />
          <h1 className="welcome-title">Welcome to DevFlowHub</h1>
          <p className="welcome-subtitle">Unifying developer productivity. 🚀</p>
        </div>
        
        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Project Insights</h3>
            <p>Get AI-powered insights and analytics for your development projects</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Seamless Integrations</h3>
            <p>Connect with GitHub, Jira, and other development tools</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Learning Hub</h3>
            <p>Access documentation and learning resources in one place</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Team Collaboration</h3>
            <p>Work together with your team efficiently</p>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="welcome-cta-button"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
          <p className="welcome-login-text">
            Already have an account?{' '}
            <span 
              className="welcome-login-link"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
      
      <div className="welcome-background">
        <div className="welcome-bg-shape welcome-bg-shape-1"></div>
        <div className="welcome-bg-shape welcome-bg-shape-2"></div>
        <div className="welcome-bg-shape welcome-bg-shape-3"></div>
      </div>
    </div>
  );
};

export default Welcome;
