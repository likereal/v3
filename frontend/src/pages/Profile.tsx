import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    created: string;
    updated: string;
  };
}

const Profile: React.FC = () => {
  const { user, userInfo, logout, connectGithub, connectJira, disconnectGithub, disconnectJira, fetchJiraUserInfo, idToken } = useAuth();
  const navigate = useNavigate();
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
  const [loadingJira, setLoadingJira] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchJiraUserInfo();
      fetchJiraData();
    }
  }, [user]);

  const fetchJiraData = async () => {
    if (!idToken || !userInfo?.jira) return;
    
    setLoadingJira(true);
    try {
      // Fetch Jira projects
      const projectsRes = await axios.get<JiraProject[]>('http://localhost:5000/api/jira/projects', {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      });
      setJiraProjects(projectsRes.data);

      // Fetch recent Jira issues
      const issuesRes = await axios.get<JiraIssue[]>('http://localhost:5000/api/jira/issues', {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      });
      setJiraIssues(issuesRes.data);
    } catch (error) {
      console.error('Failed to fetch Jira data:', error);
    } finally {
      setLoadingJira(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', background: '#232946', color: '#fff', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 12px #0002' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Profile</h2>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div><b>Email:</b> {user.email}</div>
        {userInfo?.name && <div><b>Name:</b> {userInfo.name}</div>}
        {userInfo?.avatar && <img src={userInfo.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', margin: '1rem 0' }} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* GitHub Section */}
        <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#eebbc3' }}>GitHub</h3>
            {userInfo?.github ? (
              <button 
                onClick={disconnectGithub} 
                style={{ 
                  padding: '0.3em 0.8em', 
                  borderRadius: 4, 
                  background: '#dc3545', 
                  color: '#fff', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => { if (!user) { navigate('/auth'); } else { connectGithub(); } }}
                style={{ 
                  padding: '0.3em 0.8em', 
                  borderRadius: 4, 
                  background: '#181818', 
                  color: '#eebbc3', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                Connect
              </button>
            )}
          </div>

          {userInfo?.github ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                {userInfo.github.avatar_url && (
                  <img src={userInfo.github.avatar_url} alt="GitHub avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 12 }} />
                )}
                <div>
                  <div><b>{userInfo.github.login || userInfo.name}</b></div>
                  <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>{userInfo.github.email}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>
                <div>Account Type: {userInfo.github.type || 'User'}</div>
                {userInfo.github.html_url && (
                  <div>Profile: <a href={userInfo.github.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3' }}>View on GitHub</a></div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#b8c1ec' }}>
              <p>Connect your GitHub account to see your repositories and contributions</p>
            </div>
          )}
        </div>

        {/* Jira Section */}
        <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#eebbc3' }}>Jira</h3>
            {userInfo?.jira ? (
              <button 
                onClick={disconnectJira} 
                style={{ 
                  padding: '0.3em 0.8em', 
                  borderRadius: 4, 
                  background: '#dc3545', 
                  color: '#fff', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => { if (!user) { navigate('/auth'); } else { connectJira(); } }}
                style={{ 
                  padding: '0.3em 0.8em', 
                  borderRadius: 4, 
                  background: '#181818', 
                  color: '#eebbc3', 
                  fontWeight: 600, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                Connect
              </button>
            )}
          </div>

          {userInfo?.jira ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div><b>{userInfo.jira.displayName || userInfo.jira.name}</b></div>
                <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>{userInfo.jira.email}</div>
                <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>Account ID: {userInfo.jira.account_id}</div>
              </div>
              
              {loadingJira ? (
                <div style={{ color: '#eebbc3' }}>Loading Jira data...</div>
              ) : (
                <>
                  {jiraProjects.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ color: '#eebbc3', marginBottom: 8, fontSize: '1em' }}>Projects ({jiraProjects.length})</h4>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {jiraProjects.slice(0, 3).map(project => (
                          <div key={project.id} style={{ background: '#232946', padding: 6, borderRadius: 4, fontSize: '0.8em' }}>
                            <div><b>{project.key}</b> - {project.name}</div>
                            <div style={{ fontSize: '0.7em', color: '#b8c1ec' }}>Type: {project.projectTypeKey}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {jiraIssues.length > 0 && (
                    <div>
                      <h4 style={{ color: '#eebbc3', marginBottom: 8, fontSize: '1em' }}>Recent Issues ({jiraIssues.length})</h4>
                      <div style={{ display: 'grid', gap: 6 }}>
                        {jiraIssues.slice(0, 3).map(issue => (
                          <div key={issue.id} style={{ background: '#232946', padding: 6, borderRadius: 4, fontSize: '0.8em' }}>
                            <div><b>{issue.key}</b> - {issue.fields.summary}</div>
                            <div style={{ fontSize: '0.7em', color: '#b8c1ec' }}>
                              Status: {issue.fields.status.name} | Created: {new Date(issue.fields.created).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {userInfo?.jira && (
                <button 
                  onClick={fetchJiraData} 
                  style={{ 
                    marginTop: 16, 
                    padding: '0.4em 1em', 
                    borderRadius: 4, 
                    background: '#181818', 
                    color: '#eebbc3', 
                    fontWeight: 600, 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '0.8em',
                    width: '100%'
                  }}
                >
                  Refresh Jira Data
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#b8c1ec' }}>
              <p>Connect your Jira account to see your projects and issues</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button 
          onClick={logout} 
          style={{ 
            padding: '0.7em 2em', 
            borderRadius: 8, 
            background: '#fff', 
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
  );
};

export default Profile; 