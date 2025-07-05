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
  const [githubClosedIssues, setGithubClosedIssues] = useState<any[]>([]);
  const [githubClosedPRs, setGithubClosedPRs] = useState<any[]>([]);
  const [repoDetails, setRepoDetails] = useState<any>(null);
  const [recentCommits, setRecentCommits] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any>({});
  const [githubStatsLoading, setGithubStatsLoading] = useState(false);

  // Jira state for Tasks & Projects
  const [jiraIssues, setJiraIssues] = useState<any[]>([]);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraUserStories, setJiraUserStories] = useState<any[]>([]);
  const [jiraUserStoriesLoading, setJiraUserStoriesLoading] = useState(false);

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

  // Fetch additional GitHub repository data
  useEffect(() => {
    if (userInfo?.github) {
      setGithubStatsLoading(true);
      
      // Fetch repository details, commits, contributors, and languages in parallel
      Promise.all([
        axios.get('http://localhost:5000/api/github/repo?owner=likereal&repo=v3'),
        axios.get('http://localhost:5000/api/github/commits?owner=likereal&repo=v3'),
        axios.get('http://localhost:5000/api/github/contributors?owner=likereal&repo=v3'),
        axios.get('http://localhost:5000/api/github/languages?owner=likereal&repo=v3'),
        axios.get('http://localhost:5000/api/github/issues?owner=likereal&repo=v3&state=closed'),
        axios.get('http://localhost:5000/api/github/issues?owner=likereal&repo=v3&state=closed')
      ])
        .then(([repoRes, commitsRes, contributorsRes, languagesRes, closedIssuesRes, closedPRsRes]) => {
          setRepoDetails(repoRes.data);
          setRecentCommits(commitsRes.data || []);
          setContributors(contributorsRes.data || []);
          setLanguages(languagesRes.data || {});
          setGithubClosedIssues(closedIssuesRes.data || []);
          // Filter closed issues to get only pull requests
          const closedPRs = closedPRsRes.data ? closedPRsRes.data.filter((issue: any) => issue.pull_request) : [];
          setGithubClosedPRs(closedPRs);
          console.log('GitHub Stats Data:', {
            repoDetails: repoRes.data,
            closedIssues: closedIssuesRes.data,
            closedPRs: closedPRs,
            closedPRsLength: closedPRs.length
          });
          setGithubStatsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch GitHub stats:', err);
          setGithubStatsLoading(false);
        });
    }
  }, [userInfo?.github]);

  // Function to fetch Jira issues
  const fetchJiraData = useCallback(() => {
    if (!userInfo?.jira || !idToken) return;
    
    setJiraLoading(true);
    setJiraUserStoriesLoading(true);
    setJiraError(null);
    
    // Get selected project from localStorage
    const selectedProject = localStorage.getItem('selectedJiraProject');
    const issuesUrl = selectedProject 
      ? `http://localhost:5000/api/jira/issues?project=${encodeURIComponent(selectedProject)}`
      : 'http://localhost:5000/api/jira/issues';
    const userStoriesUrl = selectedProject 
      ? `http://localhost:5000/api/jira/user-stories?project=${encodeURIComponent(selectedProject)}`
      : 'http://localhost:5000/api/jira/user-stories';
    
    // Fetch both issues and user stories
    Promise.all([
      axios.get(issuesUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      }),
      axios.get(userStoriesUrl, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      })
    ])
      .then(([issuesRes, userStoriesRes]) => {
        // Handle issues response
        if (Array.isArray(issuesRes.data)) {
          setJiraIssues(issuesRes.data);
        } else {
          setJiraIssues(issuesRes.data.issues || []);
        }
        
        // Handle user stories response
        if (Array.isArray(userStoriesRes.data)) {
          setJiraUserStories(userStoriesRes.data);
        } else {
          setJiraUserStories(userStoriesRes.data.userStories || []);
        }
        
        setJiraLoading(false);
        setJiraUserStoriesLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          setJiraError('Jira authentication failed. Please reconnect your Jira account.');
        } else if (err.response?.status === 403) {
          setJiraError('Insufficient Jira permissions. Please check your account settings.');
        } else {
          setJiraError('Failed to fetch Jira data');
        }
        setJiraLoading(false);
        setJiraUserStoriesLoading(false);
      });
  }, [userInfo?.jira, idToken]);

  // Fetch Jira data if connected
  useEffect(() => {
    fetchJiraData();
  }, [fetchJiraData]);

  // Listen for changes in localStorage (project selection)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedJiraProject') {
        fetchJiraData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchJiraData]);

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
                  <b>Project Items</b>
                  <div style={{ fontSize: '0.9em', color: '#aaa', marginTop: 4 }}>
                    {jiraIssues.length + jiraUserStories.length} items
                    {(() => {
                      const selectedProject = localStorage.getItem('selectedJiraProject');
                      return selectedProject ? ` from project ${selectedProject}` : ' (all assigned)';
                    })()}
                  </div>
                </div>
                
                {(jiraIssues.length === 0 && jiraUserStories.length === 0) ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                    No items found.
                  </div>
                ) : (
                  <div className="jira-issues-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {[...jiraIssues, ...jiraUserStories]
                      .sort((a, b) => new Date(b.fields.updated).getTime() - new Date(a.fields.updated).getTime())
                      .slice(0, 12)
                      .map(item => {
                        const isUserStory = item.fields.issuetype?.name === 'Story';
                        const keyColor = isUserStory ? '#9C27B0' : '#eebbc3';
                        return (
                          <div key={item.id} className="card" style={{ padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div 
                                  style={{ 
                                    fontWeight: '600', 
                                    color: keyColor, 
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                  }}
                                  onClick={() => {
                                    // Open Jira issue in new tab
                                    const selectedProject = localStorage.getItem('selectedJiraProject');
                                    if (selectedProject) {
                                      window.open(`https://v3hackathon.atlassian.net/browse/${item.key}`, '_blank');
                                    } else {
                                      // Fallback to general Jira dashboard
                                      window.open('https://app.atlassian.com', '_blank');
                                    }
                                  }}
                                  title="Click to open in Jira"
                                >
                                  {item.key}
                                </div>
                                {item.fields.issuetype && (
                                  <span style={{ 
                                    background: '#2a2a3e', 
                                    color: '#b8c1ec', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    fontSize: '0.7em',
                                    fontWeight: '500'
                                  }}>
                                    {item.fields.issuetype.name}
                                  </span>
                                )}
                                {item.fields.priority && (
                                  <span style={{ 
                                    background: item.fields.priority.name === 'High' ? '#dc3545' : 
                                               item.fields.priority.name === 'Medium' ? '#ffd700' : '#6c757d',
                                    color: '#fff', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    fontSize: '0.7em',
                                    fontWeight: '600'
                                  }}>
                                    {item.fields.priority.name}
                                  </span>
                                )}
                              </div>
                              <div style={{ 
                                background: item.fields.status.statusCategory?.colorName === 'green' ? '#43d17a' : 
                                           item.fields.status.statusCategory?.colorName === 'yellow' ? '#ffd700' : 
                                           item.fields.status.statusCategory?.colorName === 'red' ? '#dc3545' : '#6c757d',
                                color: '#fff',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75em',
                                fontWeight: '600'
                              }}>
                                {item.fields.status.name}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.9em', marginBottom: '6px', lineHeight: '1.4' }}>
                              {item.fields.summary}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8em', color: '#aaa' }}>
                              <div>
                                {item.fields.assignee ? (
                                  <span>👤 {item.fields.assignee.displayName}</span>
                                ) : (
                                  <span style={{ color: '#ff6b6b' }}>⚠️ Unassigned</span>
                                )}
                              </div>
                              <div>
                                Updated: {item.fields.updated ? new Date(item.fields.updated).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                  <button onClick={fetchJiraData} className="MuiButton-root">Refresh</button>
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
            (githubLoading || githubStatsLoading) ? (
              <div>Loading GitHub repo details...</div>
            ) : githubError ? (
              <div style={{ color: 'red' }}>{githubError}</div>
            ) : (
              <div>
                {/* Repository Overview */}
                <div style={{ marginBottom: 8 }}>
                  <b>Repository:</b> {repoDetails?.full_name || 'likereal/v3'}
                </div>
                {repoDetails && (
                  <div style={{ marginBottom: 12, padding: '8px', background: '#2a2a3e', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>⭐ {repoDetails.stargazers_count || 0} stars</span>
                      <span>🔀 {repoDetails.forks_count || 0} forks</span>
                      <span>👀 {repoDetails.watchers_count || 0} watchers</span>
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#aaa' }}>
                      {repoDetails.description || 'No description available'}
                    </div>
                  </div>
                )}
                
                {/* Language Breakdown */}
                {Object.keys(languages).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <b>Languages:</b>
                    <div style={{ marginTop: 4 }}>
                      {Object.entries(languages)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([lang, bytes]) => (
                          <span key={lang} style={{ 
                            display: 'inline-block', 
                            background: '#2a2a3e', 
                            padding: '2px 6px', 
                            margin: '2px', 
                            borderRadius: '4px',
                            fontSize: '0.8em'
                          }}>
                            {lang}: {Math.round((bytes as number) / 1024)}KB
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Activity */}
                {recentCommits.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <b>Recent Commits:</b>
                    <div style={{ marginTop: 4, maxHeight: '120px', overflowY: 'auto' }}>
                      {recentCommits.slice(0, 3).map((commit, idx) => (
                        <div key={idx} style={{ marginBottom: 4, fontSize: '0.85em' }}>
                          <a href={commit.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                            {commit.sha.substring(0, 6)}: {commit.commit.message.split('\n')[0]}
                          </a>
                          <div style={{ color: '#aaa', fontSize: '0.8em' }}>
                            by {commit.commit.author.name} • {new Date(commit.commit.author.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Contributors */}
                {contributors.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <b>Top Contributors:</b>
                    <div style={{ marginTop: 4 }}>
                      {contributors.slice(0, 3).map((contributor, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                          <img 
                            src={contributor.avatar_url} 
                            alt={contributor.login}
                            style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '6px' }}
                          />
                          <span style={{ fontSize: '0.85em' }}>{contributor.login}</span>
                          <span style={{ fontSize: '0.75em', color: '#aaa', marginLeft: 'auto' }}>
                            {contributor.contributions} commits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Issue/PR Stats */}
                <div style={{ marginBottom: 12, padding: '8px', background: '#2a2a3e', borderRadius: '6px' }}>
                  <div style={{ marginBottom: 6, fontWeight: 'bold' }}>Issues & Pull Requests</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                    <div>
                      <span style={{ color: '#4CAF50' }}>●</span> Open Issues: {githubIssues.filter(issue => !issue.pull_request).length}
                    </div>
                    <div>
                      <span style={{ color: '#ff6b6b' }}>●</span> Closed Issues: {githubClosedIssues.filter(issue => !issue.pull_request).length}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginTop: 4 }}>
                    <div>
                      <span style={{ color: '#4CAF50' }}>●</span> Open PRs: {githubIssues.filter(issue => issue.pull_request).length}
                    </div>
                    <div>
                      <span style={{ color: '#ff6b6b' }}>●</span> Closed PRs: {githubClosedPRs ? githubClosedPRs.length : 0}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', marginTop: 4, paddingTop: 4, borderTop: '1px solid #444' }}>
                    <div>
                      <b>Total Issues:</b> {githubIssues.filter(issue => !issue.pull_request).length + githubClosedIssues.filter(issue => !issue.pull_request).length}
                    </div>
                    <div>
                      <b>Total PRs:</b> {githubIssues.filter(issue => issue.pull_request).length + (githubClosedPRs ? githubClosedPRs.length : 0)}
                    </div>
                  </div>
                </div>
                
                {/* Repository Stats */}
                {repoDetails && (
                  <div style={{ marginBottom: 12, padding: '8px', background: '#2a2a3e', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                      <span>📁 {repoDetails.size || 0} KB</span>
                      <span>📅 Updated {repoDetails.updated_at ? new Date(repoDetails.updated_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                )}
                
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
      </div>
    </>
  );
};

export default Dashboard; 