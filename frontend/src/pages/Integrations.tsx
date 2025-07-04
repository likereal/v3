import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Integrations.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GitHubIssuesWidget = ({ owner, repo, error }: { owner: string; repo: string; error: string | null }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!owner || !repo || error) return;
    setLoading(true);
    axios.get(`/api/github/issues?owner=${owner}&repo=${repo}`)
      .then(res => {
        setIssues(res.data as any[]);
        setLoading(false);
      })
      .catch(() => {
        setIssues([]);
        setLoading(false);
      });
  }, [owner, repo, error]);

  if (error) return null;
  if (loading) return <div>Loading GitHub issues...</div>;
  if (!issues.length) return <div>No issues found.</div>;

  return (
    <div>
      <h3>GitHub Issues</h3>
      <ul>
        {issues.map(issue => (
          <li key={issue.id}>
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const JiraProjectsWidget = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { idToken } = useAuth();

  // Load selected project from localStorage
  useEffect(() => {
    const savedProject = localStorage.getItem('selectedJiraProject');
    if (savedProject) {
      setSelectedProject(savedProject);
    }
  }, []);

  // Save selected project to localStorage
  const handleProjectSelect = (projectKey: string) => {
    setSelectedProject(projectKey);
    localStorage.setItem('selectedJiraProject', projectKey);
  };

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    axios.get('http://localhost:5000/api/jira/projects', {
      headers: { Authorization: `Bearer ${idToken}` },
      withCredentials: true
    })
      .then(res => {
        setProjects(res.data as any[]);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, [idToken]);

  if (loading) return <div>Loading Jira projects...</div>;
  if (!projects.length) return <div>No projects found.</div>;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#eebbc3' }}>Select Project for Dashboard & Notifications</h4>
        <select 
          value={selectedProject} 
          onChange={(e) => handleProjectSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #2a2a3e',
            fontSize: '14px'
          }}
        >
          <option value="">-- Select a project --</option>
          {projects.map(project => (
            <option key={project.id} value={project.key}>
              {project.key} - {project.name}
            </option>
          ))}
        </select>
        {selectedProject && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: '#1a3a1a', 
            borderRadius: '4px',
            border: '1px solid #43d17a',
            fontSize: '12px'
          }}>
            ✅ Selected: {selectedProject} - {projects.find(p => p.key === selectedProject)?.name}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#eebbc3' }}>Available Projects</h4>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto',
          background: '#1a1a2e',
          borderRadius: '6px',
          padding: '8px'
        }}>
          {projects.map(project => (
            <div 
              key={project.id} 
              style={{ 
                padding: '8px',
                borderBottom: '1px solid #2a2a3e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ color: '#eebbc3' }}>{project.key}</strong> - {project.name}
              </div>
              {selectedProject === project.key && (
                <span style={{ 
                  background: '#43d17a', 
                  color: '#fff', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  SELECTED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Integrations: React.FC = () => {
  // GitHub state
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const { userInfo, connectGithub, connectJira, disconnectGithub, disconnectJira } = useAuth();
  const navigate = useNavigate();

  const handleGithubConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setGithubError(null);
    setGithubConnected(false);
    try {
      let url = `/api/github/issues?owner=${owner}&repo=${repo}`;
      if (githubToken) {
        url += `&token=${encodeURIComponent(githubToken)}`;
      }
      const res = await axios.get(url);
      if (res.data && Array.isArray(res.data)) {
        setGithubConnected(true);
      } else {
        setGithubError('Unexpected response from server.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setGithubError(err.response.data.error);
      } else {
        setGithubError(err.message);
      }
    }
  };

  return (
    <div className="integrations-page integrations-root" style={{ background: '#1c1c27', borderRadius: 14, boxShadow: '0 2px 12px #181818', padding: 18, color: '#fff', maxWidth: 950, margin: '28px auto' }}>
      <h2 style={{ color: '#eebbc3', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Integrations</h2>
      <div className="integrations-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* GitHub Card */}
        <div className="integration-card" style={{ background: '#232946', borderRadius: 8, boxShadow: '0 2px 4px #181818', padding: 18, color: '#fff', border: '1px solid #232946', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#eebbc3', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>GitHub Integration</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: userInfo?.github ? '#43d17a' : '#e84545',
                color: '#fff',
                borderRadius: 8,
                padding: '0.25em 0.75em',
                fontSize: '0.95em',
                fontWeight: 600,
                border: '1.5px solid #232946',
                boxShadow: '0 2px 8px #181818'
              }}>
                {userInfo?.github ? 'Connected' : 'Not Connected'}
              </span>
              {userInfo?.github ? (
                <button 
                  onClick={disconnectGithub}
                  style={{
                    background: '#e84545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.25em 0.75em',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px #232946',
                    transition: 'background 0.18s, color 0.18s'
                  }}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => { if (!userInfo) { navigate('/auth'); } else { connectGithub(); } }}
                  style={{
                    background: '#eebbc3',
                    color: '#232946',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.25em 0.75em',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px #232946',
                    transition: 'background 0.18s, color 0.18s'
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {!userInfo?.github ? (
            <p style={{ color: '#b8c1ec', marginBottom: '0.5rem', fontSize: 12 }}>
              Connect your GitHub account to access repositories and issues.
            </p>
          ) : (
            <>
              {userInfo.github && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', padding: '0.7rem', background: '#232946', borderRadius: 6, border: '1px solid #232946', color: '#fff' }}>
                  {userInfo.github.avatar_url && (
                    <img src={userInfo.github.avatar_url} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 12 }} />
                  )}
                  <div>
                    <div><b>{userInfo.github.login || userInfo.github.name}</b></div>
                    <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>{userInfo.github.email}</div>
                    {userInfo.github.html_url && (
                      <a href={userInfo.github.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3', fontSize: '0.9em', textDecoration: 'underline' }}>View Profile</a>
                    )}
                  </div>
                </div>
              )}
              
              {githubError && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {githubError}</div>}
              
              <form onSubmit={handleGithubConnect} style={{ marginTop: 4 }}>
                <div style={{ marginBottom: 4 }}>
                  <label style={{ color: '#b8c1ec', marginRight: 8 }}>Owner:</label>
                  <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. octocat" style={{ background: '#181818', color: '#fff', border: '1px solid #b8c1ec', borderRadius: 5, padding: '4px 7px', fontSize: 12 }} />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <label style={{ color: '#b8c1ec', marginRight: 8 }}>Repo:</label>
                  <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="e.g. Hello-World" style={{ background: '#181818', color: '#fff', border: '1px solid #b8c1ec', borderRadius: 5, padding: '4px 7px', fontSize: 12 }} />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <label style={{ color: '#b8c1ec', marginRight: 8 }}>Username:</label>
                  <input value={githubUsername} onChange={e => setGithubUsername(e.target.value)} placeholder="(optional, leave blank to use server default)" style={{ background: '#181818', color: '#fff', border: '1px solid #b8c1ec', borderRadius: 5, padding: '4px 7px', fontSize: 12 }} />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <label style={{ color: '#b8c1ec', marginRight: 8 }}>Token:</label>
                  <input value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="(optional, leave blank to use server default)" type="password" style={{ background: '#181818', color: '#fff', border: '1px solid #b8c1ec', borderRadius: 5, padding: '4px 7px', fontSize: 12 }} />
                </div>
                <button type="submit" style={{ background: '#eebbc3', color: '#232946', border: 'none', borderRadius: 5, padding: '4px 10px', fontWeight: 700, fontSize: 12, boxShadow: '0 2px 4px #232946', transition: 'background 0.18s, color 0.18s' }}>Connect to GitHub</button>
              </form>
              
              {githubConnected && <GitHubIssuesWidget owner={owner} repo={repo} error={githubError} />}
            </>
          )}
        </div>

        {/* Jira Card */}
        <div className="integration-card" style={{ background: '#232946', borderRadius: 8, boxShadow: '0 2px 4px #181818', padding: 18, color: '#fff', border: '1px solid #232946', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: '#eebbc3', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>Jira Integration</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: userInfo?.jira ? '#43d17a' : '#e84545',
                color: '#fff',
                borderRadius: 8,
                padding: '0.25em 0.75em',
                fontSize: '0.95em',
                fontWeight: 600,
                border: '1.5px solid #232946',
                boxShadow: '0 2px 8px #181818'
              }}>
                {userInfo?.jira ? 'Connected' : 'Not Connected'}
              </span>
              {userInfo?.jira ? (
                <button 
                  onClick={disconnectJira}
                  style={{
                    background: '#e84545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.25em 0.75em',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px #232946',
                    transition: 'background 0.18s, color 0.18s'
                  }}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => { if (!userInfo) { navigate('/auth'); } else { connectJira(); } }}
                  style={{
                    background: '#eebbc3',
                    color: '#232946',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.25em 0.75em',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px #232946',
                    transition: 'background 0.18s, color 0.18s'
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          {!userInfo?.jira ? (
            <p style={{ color: '#b8c1ec', marginBottom: '0.3rem', fontSize: 11 }}>
              Connect your Jira account to access projects and issues.
            </p>
          ) : (
            <>
              {userInfo.jira && (
                <div style={{ marginBottom: '0.5rem', padding: '8px', background: '#232946', borderRadius: 6, border: '1px solid #232946', color: '#fff' }}>
                  <div><b>{userInfo.jira.displayName || userInfo.jira.name}</b></div>
                  <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>{userInfo.jira.email}</div>
                  <div style={{ fontSize: '0.9em', color: '#b8c1ec' }}>Account ID: {userInfo.jira.account_id}</div>
                </div>
              )}
              
              <div style={{ 
                marginBottom: '0.5rem', 
                padding: '8px', 
                background: '#181818', 
                borderRadius: '4px',
                border: '1px solid #43d17a',
                color: '#43d17a',
                fontWeight: 600
              }}>
                <div style={{ fontSize: '0.75em', fontWeight: '600', marginBottom: '1px' }}>
                  💡 Project Selection
                </div>
                <div style={{ fontSize: '0.7em', color: '#b8c1ec', fontWeight: 400 }}>
                  Select a project below to filter issues in the Dashboard and Notifications tabs. 
                  If no project is selected, all your assigned issues will be shown.
                </div>
              </div>
              
              <JiraProjectsWidget />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Integrations; 