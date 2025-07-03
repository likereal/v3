import React from 'react';
import Widget from '../components/Widget';
import './Dashboard.css';

const Dashboard: React.FC = () => (
  <div className="dashboard-grid">
    <Widget title="Tasks & Projects">
      <p>View and manage your tasks from Jira, Trello, etc.</p>
    </Widget>
    <Widget title="Code Insights">
      <p>See code metrics, PRs, and build status from GitHub.</p>
    </Widget>
    <Widget title="Documentation">
      <p>Access project docs, wikis, and knowledge base.</p>
    </Widget>
    <Widget title="Learning Resources">
      <p>Find relevant learning modules and bookmarks.</p>
    </Widget>
    <Widget title="Team Progress">
      <p>Track team activity, roles, and progress.</p>
    </Widget>
  </div>
);

export default Dashboard; 