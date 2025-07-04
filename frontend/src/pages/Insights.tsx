import React from 'react';
import InsightsChat from '../components/InsightsChat';
import './Insights.css';

const Insights: React.FC = () => {
  return (
    <div className="insights-container">
      <div className="insights-header">
        <h1>AI Insights</h1>
        <p>Get AI-powered insights and recommendations for your development workflow</p>
      </div>
      <InsightsChat />
    </div>
  );
};

export default Insights; 