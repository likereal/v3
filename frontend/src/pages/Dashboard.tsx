import React, { useEffect, useState } from 'react';
import Widget from '../components/Widget';
import './Dashboard.css';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [jiraLoggedIn, setJiraLoggedIn] = useState(false);
  const [jiraUser, setJiraUser] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/jira/token', { withCredentials: true })
      .then(res => {
        if (res.data && (res.data as { accessToken?: string }).accessToken) {
          setJiraLoggedIn(true);
          // Fetch user info from Jira API using the token
          axios.get('http://localhost:5000/auth/jira/user', { withCredentials: true })
            .then(userRes => setJiraUser(userRes.data))
            .catch(() => setJiraUser(null));
        }
      })
      .catch(() => {
        setJiraLoggedIn(false);
        setJiraUser(null);
      });
  }, []);

  return (
    <>
      {jiraLoggedIn && jiraUser && (
        <div style={{ background: '#232946', color: '#eebbc3', padding: '1rem', borderRadius: 8, marginBottom: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
          {jiraUser.picture && <img src={jiraUser.picture} alt="Jira avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} />}
          <div>
            <b>Jira Connected!</b><br />
            {jiraUser.name && <span>Name: {jiraUser.name} <br /></span>}
            {jiraUser.email && <span>Email: {jiraUser.email} <br /></span>}
            {jiraUser.account_id && <span>Account ID: {jiraUser.account_id}</span>}
          </div>
        </div>
      )}
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
    </>
  );
};

export default Dashboard; 