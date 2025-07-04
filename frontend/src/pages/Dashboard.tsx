import React, { useEffect, useState, useCallback } from 'react';
import Widget from '../components/Widget';
import './Dashboard.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, userInfo, loading: authLoading, login, connectGithub, connectJira, idToken } = useAuth();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // GitHub state for Code Insights
  const [githubIssues, setGithubIssues] = useState<any[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Jira state for Tasks & Projects
  const [jiraIssues, setJiraIssues] = useState<any[]>([]);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);

  // Fetch GitHub issues if connected
  useEffect(() => {
    if (userInfo?.github) {
      setGithubLoading(true);
      setGithubError(null);
      axios.get('/api/github/issues?owner=likereal&repo=v3')
        .then(res => {
          setGithubIssues(res.data as any[]);
          setGithubLoading(false);
        })
        .catch(err => {
          setGithubError('Failed to fetch GitHub issues');
          setGithubLoading(false);
        });
    }
  }, [userInfo?.github]);

  // Function to fetch Jira issues
  const fetchJiraIssues = useCallback(() => {
    if (!userInfo?.jira || !idToken) return;
    
    setJiraLoading(true);
    setJiraError(null);
    
    // Get selected project from localStorage
    const selectedProject = localStorage.getItem('selectedJiraProject');
    const url = selectedProject 
      ? `http://localhost:5000/api/jira/issues?project=${encodeURIComponent(selectedProject)}`
      : 'http://localhost:5000/api/jira/issues';
    
    axios.get(url, {
      headers: { Authorization: `Bearer ${idToken}` },
      withCredentials: true
    })
      .then(res => {
        setJiraIssues(res.data as any[]);
        setJiraLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          setJiraError('Jira authentication failed. Please reconnect your Jira account.');
        } else if (err.response?.status === 403) {
          setJiraError('Insufficient Jira permissions. Please check your account settings.');
        } else {
          setJiraError('Failed to fetch Jira issues');
        }
        setJiraLoading(false);
      });
  }, [userInfo?.jira, idToken]);

  // Fetch Jira issues if connected
  useEffect(() => {
    fetchJiraIssues();
  }, [fetchJiraIssues]);

  // Listen for changes in localStorage (project selection)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedJiraProject') {
        fetchJiraIssues();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchJiraIssues]);

  if (authLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="dashboard-grid card">
        <Widget title="Tasks & Projects">
          {user && userInfo?.jira ? (
            jiraLoading ? (
              <div>Loading Jira tasks...</div>
            ) : jiraError ? (
              <div style={{ color: 'red' }}>{jiraError}</div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <b>Project Issues</b>
                  <div style={{ fontSize: '0.9em', color: '#aaa', marginTop: 4 }}>
                    {jiraIssues.length} issues
                    {(() => {
                      const selectedProject = localStorage.getItem('selectedJiraProject');
                      return selectedProject ? ` from project ${selectedProject}` : ' (all assigned)';
                    })()}
                  </div>
                </div>
                
                {jiraIssues.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                    No issues found.
                  </div>
                ) : (
                  <div className="jira-issues-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {jiraIssues.slice(0, 12).map(issue => (
                      <div key={issue.id} className="card" style={{ padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontWeight: '600', color: '#eebbc3' }}>
                              {issue.key}
                            </div>
                            {issue.fields.issuetype && (
                              <span style={{ 
                                background: '#2a2a3e', 
                                color: '#b8c1ec', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '0.7em',
                                fontWeight: '500'
                              }}>
                                {issue.fields.issuetype.name}
                              </span>
                            )}
                            {issue.fields.priority && (
                              <span style={{ 
                                background: issue.fields.priority.name === 'High' ? '#dc3545' : 
                                           issue.fields.priority.name === 'Medium' ? '#ffd700' : '#6c757d',
                                color: '#fff', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '0.7em',
                                fontWeight: '600'
                              }}>
                                {issue.fields.priority.name}
                              </span>
                            )}
                          </div>
                          <div style={{ 
                            background: issue.fields.status.statusCategory?.colorName === 'green' ? '#43d17a' : 
                                       issue.fields.status.statusCategory?.colorName === 'yellow' ? '#ffd700' : 
                                       issue.fields.status.statusCategory?.colorName === 'red' ? '#dc3545' : '#6c757d',
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75em',
                            fontWeight: '600'
                          }}>
                            {issue.fields.status.name}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.9em', marginBottom: '6px', lineHeight: '1.4' }}>
                          {issue.fields.summary}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8em', color: '#aaa' }}>
                          <div>
                            {issue.fields.assignee ? (
                              <span>👤 {issue.fields.assignee.displayName}</span>
                            ) : (
                              <span style={{ color: '#ff6b6b' }}>⚠️ Unassigned</span>
                            )}
                          </div>
                          <div>
                            Updated: {issue.fields.updated ? new Date(issue.fields.updated).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => {
                      const selectedProject = localStorage.getItem('selectedJiraProject');
                      if (selectedProject) {
                        // Open the specific project board
                        window.open(`https://v3hackathon.atlassian.net/browse/${selectedProject}`, '_blank');
                      } else {
                        // Fallback to general Jira dashboard
                        window.open('https://app.atlassian.com', '_blank');
                      }
                    }}
                    className="MuiButton-root"
                  >
                    View All in Jira
                  </button>
                  <button onClick={fetchJiraIssues} className="MuiButton-root">Refresh</button>
                </div>
              </div>
            )
          ) : (
            <div style={{ color: '#fff' }}>
              {user ? (
                <>
                  <div style={{ marginBottom: '12px' }}>Connect Jira to see your assigned tasks and projects.</div>
                  <button 
                    onClick={() => { if (!user) { navigate('/auth'); } else { connectJira(); } }} 
                    style={{ 
                      padding: '0.7em 2em', 
                      borderRadius: '6px', 
                      background: '#181818', 
                      color: '#eebbc3', 
                      fontWeight: '600', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    Connect Jira
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>Log in to connect Jira and see your tasks.</div>
                  <button 
                    onClick={() => navigate('/auth')} 
                    style={{ 
                      padding: '0.7em 2em', 
                      borderRadius: '6px', 
                      background: '#fff', 
                      color: '#232946', 
                      fontWeight: '600', 
                      border: 'none', 
                      cursor: 'pointer' 
                    }}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          )}
        </Widget>
        <Widget title="Code Insights">
          {user && userInfo?.github ? (
            githubLoading ? (
              <div>Loading GitHub repo details...</div>
            ) : githubError ? (
              <div style={{ color: 'red' }}>{githubError}</div>
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <b>Repo:</b> likereal/v3
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Open Issues:</b> {githubIssues.filter(issue => !issue.pull_request).length}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Open PRs:</b> {githubIssues.filter(issue => issue.pull_request).length}
                </div>
                {/* Build Status Placeholder */}
                <div style={{ marginBottom: 8 }}>
                  <b>Build Status:</b> <span style={{ color: '#fff' }}>Coming soon</span>
                </div>
                {/* Code Metrics Placeholder */}
                <div style={{ marginBottom: 8 }}>
                  <b>Code Metrics:</b> <span style={{ color: '#fff' }}>Coming soon</span>
                </div>
                {/* PRs List */}
                <div style={{ marginTop: 16 }}>
                  <b>Pull Requests</b>
                  <ul style={{ marginTop: 6 }}>
                    {githubIssues.filter(issue => issue.pull_request).length === 0 ? (
                      <li style={{ color: '#888' }}>No pull requests found.</li>
                    ) : (
                      githubIssues.filter(issue => issue.pull_request).slice(0, 5).map(pr => (
                        <li key={pr.id} style={{ marginBottom: 8 }}>
                          <a href={pr.html_url} target="_blank" rel="noopener noreferrer">{pr.title}</a>
                          <div style={{ fontSize: '0.95em', color: '#aaa' }}>
                            by {pr.user?.login || 'unknown'} | State: {pr.state} | Created: {pr.created_at ? new Date(pr.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                {/* Issues List */}
                <div style={{ marginTop: 16 }}>
                  <b>Issues</b>
                  <ul style={{ marginTop: 6 }}>
                    {githubIssues.filter(issue => !issue.pull_request).length === 0 ? (
                      <li style={{ color: '#888' }}>No issues found.</li>
                    ) : (
                      githubIssues.filter(issue => !issue.pull_request).slice(0, 5).map(issue => (
                        <li key={issue.id} style={{ marginBottom: 8 }}>
                          <a href={issue.html_url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
                          <div style={{ fontSize: '0.95em', color: '#aaa' }}>
                            by {issue.user?.login || 'unknown'} | State: {issue.state} | Created: {issue.created_at ? new Date(issue.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )
          ) : (
            <div style={{ color: '#fff' }}>
              {user ? (
                <>
                  <div>Connect GitHub to see code insights for likereal/v3.</div>
                </>
              ) : (
                <>
                  <div>Log in to connect GitHub and see code insights for likereal/v3.</div>
                  <button onClick={() => navigate('/auth')} style={{ marginTop: 12, padding: '0.7em 2em', borderRadius: 6, background: '#fff', color: '#232946', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Login</button>
                </>
              )}
            </div>
          )}
        </Widget>
        <Widget title="Documentation">
          {(() => {
            let lastDocs = null;
            try {
              const stored = localStorage.getItem('last_docs_read');
              if (stored) lastDocs = JSON.parse(stored);
            } catch {}
            return (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <b>Access project docs, wikis, and knowledge base.</b>
                </div>
                {lastDocs ? (
                  <div style={{ color: '#eebbc3', marginBottom: 8 }}>
                    <b>Last read:</b> {lastDocs.url ? (
                      <a href={lastDocs.url} target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3', textDecoration: 'underline' }}>{lastDocs.title}</a>
                    ) : lastDocs.title}
                    <div style={{ fontSize: '0.85em', color: '#aaa' }}>
                      {lastDocs.date ? `on ${new Date(lastDocs.date).toLocaleString()}` : ''}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#888', marginBottom: 8 }}>
                    No recent docs read.
                  </div>
                )}
                <button
                  onClick={() => navigate('/docs')}
                  style={{ padding: '0.7em 2em', borderRadius: 6, background: '#eebbc3', color: '#232946', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Go to Docs
                </button>
              </div>
            );
          })()}
        </Widget>
        <Widget title="Learning Resources">
          {(() => {
            // Progress bar logic
            let hoursWatched = 0;
            try {
              const stored = localStorage.getItem('learning_hours_watched');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.date === new Date().toISOString().slice(0, 10)) {
                  hoursWatched = parsed.hours || 0;
                }
              }
            } catch {}
            if (isNaN(hoursWatched)) hoursWatched = 0;
            const cappedHours = Math.min(hoursWatched, 1);
            const percent = Math.round((cappedHours / 1) * 100);

            // Try to load last learning state from localStorage
            let learningState: any = null;
            try {
              const saved = localStorage.getItem('learning_youtube_state');
              if (saved) learningState = JSON.parse(saved);
            } catch {}
            const hasSearch = learningState && learningState.query && learningState.results && learningState.results.length > 0;
            const lastQuery = hasSearch ? learningState.query : '';
            const lastResults = hasSearch ? learningState.results.slice(0, 3) : [];
            const lastVideoId = learningState && learningState.selectedVideo;
            return (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <b>Learning Progress:</b>
                  <div style={{ marginTop: 6, marginBottom: 4, background: '#232946', borderRadius: 8, height: 18, width: '100%', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 4px #181818' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#eebbc3', borderRadius: 8, transition: 'width 0.5s' }}></div>
                    <div style={{ position: 'absolute', left: 12, top: 0, height: '100%', display: 'flex', alignItems: 'center', color: '#232946', fontWeight: 700, fontSize: '0.95em' }}>{cappedHours.toFixed(2)} / 1 hr</div>
                  </div>
                </div>
                {hasSearch ? (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <b>Last searched:</b> <span style={{ color: '#eebbc3' }}>{lastQuery}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      {lastResults.map((item: any) => {
                        const { videoId } = item.id || {};
                        const { title, thumbnails } = item.snippet || {};
                        return (
                          <div key={videoId} style={{ width: 120, cursor: 'pointer' }}
                            onClick={() => {
                              navigate('/learning');
                              setTimeout(() => {
                                try {
                                  const saved = localStorage.getItem('learning_youtube_state');
                                  if (saved) {
                                    const parsed = JSON.parse(saved);
                                    parsed.selectedVideo = videoId;
                                    localStorage.setItem('learning_youtube_state', JSON.stringify(parsed));
                                  }
                                } catch {}
                              }, 100);
                            }}
                          >
                            <img src={thumbnails?.high?.url || thumbnails?.default?.url} alt={title} style={{ width: '100%', borderRadius: 8, marginBottom: 4 }} />
                            <div style={{ fontSize: '0.85em', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {lastVideoId && (
                        <button
                          onClick={() => {
                            navigate('/learning');
                            setTimeout(() => {
                              try {
                                const saved = localStorage.getItem('learning_youtube_state');
                                if (saved) {
                                  const parsed = JSON.parse(saved);
                                  parsed.selectedVideo = lastVideoId;
                                  localStorage.setItem('learning_youtube_state', JSON.stringify(parsed));
                                }
                              } catch {}
                            }, 100);
                          }}
                          style={{ padding: '0.5em 1.2em', borderRadius: 6, background: '#eebbc3', color: '#232946', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95em' }}
                        >
                          Resume Video
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/learning')}
                        style={{ padding: '0.5em 1.2em', borderRadius: 6, background: '#232946', color: '#eebbc3', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95em' }}
                      >
                        Continue Learning
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: '#fff' }}>
                    <div style={{ marginBottom: 10 }}>Search for learning videos and resources to boost your skills.</div>
                    <button
                      onClick={() => navigate('/learning')}
                      style={{ padding: '0.7em 2em', borderRadius: 6, background: '#eebbc3', color: '#232946', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      Go to Learning
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </Widget>
        <Widget title="Team Progress">
          <p>Track team activity, roles, and progress.</p>
        </Widget>
      </div>
    </>
  );
};

export default Dashboard; 