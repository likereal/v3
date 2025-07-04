import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Integrations.css';

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

const JiraIssuesWidget = ({ domain, error, accessToken }: { domain: string; error: string | null; accessToken?: string }) => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain || error || !accessToken) return;
    setLoading(true);
    axios.get(`/api/jira/issues?domain=${domain}`, { withCredentials: true })
      .then(res => {
        setIssues(res.data as any[]);
        setLoading(false);
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.error) {
          setWidgetError(err.response.data.error);
        } else {
          setWidgetError(err.message);
        }
        setLoading(false);
      });
  }, [domain, error, accessToken]);

  if (error) return null;
  if (loading) return <div>Loading Jira issues...</div>;
  if (widgetError) return <div style={{ color: 'red' }}>Error: {widgetError}</div>;
  if (!issues.length) return <div>No issues found.</div>;

  return (
    <div>
      <h3>Jira Issues</h3>
      <table style={{ width: '100%', background: '#181818', color: '#fff', borderRadius: 8, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#232946' }}>
            <th style={{ padding: 8 }}>Key</th>
            <th style={{ padding: 8 }}>Type</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Summary</th>
            <th style={{ padding: 8 }}>Assignee</th>
            <th style={{ padding: 8 }}>Project</th>
            <th style={{ padding: 8 }}>Created</th>
            <th style={{ padding: 8 }}>Link</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(issue => (
            <tr key={issue.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: 8 }}>{issue.key}</td>
              <td style={{ padding: 8 }}>{issue.fields?.issuetype?.name}</td>
              <td style={{ padding: 8 }}>{issue.fields?.status?.name}</td>
              <td style={{ padding: 8 }}>{issue.fields?.summary}</td>
              <td style={{ padding: 8 }}>{issue.fields?.assignee?.displayName || 'Unassigned'}</td>
              <td style={{ padding: 8 }}>{issue.fields?.project?.name || ''}</td>
              <td style={{ padding: 8 }}>{issue.fields?.created ? new Date(issue.fields.created).toLocaleString() : ''}</td>
              <td style={{ padding: 8 }}>
                <a href={`https://${domain}.atlassian.net/browse/${issue.key}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4fa3ff' }}>View</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const [githubLoggedIn, setGithubLoggedIn] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);

  // Jira state
  const [domain, setDomain] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [jiraConnected, setJiraConnected] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraLoggedIn, setJiraLoggedIn] = useState(false);
  const [jiraAccessToken, setJiraAccessToken] = useState('');

  const handleGithubConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setGithubError(null);
    setGithubConnected(false);
    try {
      const res = await axios.get(`/api/github/issues?owner=${owner}&repo=${repo}&token=${encodeURIComponent(githubToken)}`);
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

  const handleJiraConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setJiraError(null);
    setJiraConnected(false);
    try {
      const res = await axios.get(`/api/jira/issues?domain=${domain}&email=${encodeURIComponent(jiraEmail)}&token=${encodeURIComponent(jiraToken)}`);
      if (res.data && Array.isArray(res.data)) {
        setJiraConnected(true);
      } else {
        setJiraError('Unexpected response from server.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setJiraError(err.response.data.error);
      } else {
        setJiraError(err.message);
      }
    }
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:5000/auth/github';
  };

  const handleJiraLogin = () => {
    window.location.href = 'http://localhost:5000/auth/jira';
  };

  // After OAuth login, fetch user info from backend session
  useEffect(() => {
    // Check if user is logged in by calling a backend endpoint
    if (githubLoggedIn) {
      axios.get('http://localhost:5000/auth/github/user', { withCredentials: true })
        .then(res => setGithubUser(res.data))
        .catch(() => setGithubUser(null));
    }
  }, [githubLoggedIn]);

  // On mount, check if user is already logged in with Jira
  useEffect(() => {
    axios.get('http://localhost:5000/auth/jira/token', { withCredentials: true })
      .then(res => {
        if (res.data && (res.data as { accessToken?: string }).accessToken) {
          setJiraLoggedIn(true);
          setJiraAccessToken((res.data as { accessToken: string }).accessToken);
        }
      })
      .catch(() => {
        setJiraLoggedIn(false);
        setJiraAccessToken('');
      });
  }, []);

  return (
    <div className="integrations-root">
      <h2>Integrations</h2>
      <div className="integrations-cards">
        {/* GitHub Card */}
        <div className="integration-card">
          <h3>GitHub Integration</h3>
          {!githubLoggedIn ? (
            <button onClick={handleGithubLogin} style={{ marginBottom: '1rem' }}>
              Login with GitHub
            </button>
          ) : null}
          {githubLoggedIn && githubUser && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <img src={githubUser.avatar_url} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 12 }} />
              <div>
                <div><b>{githubUser.login}</b></div>
                <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer">View Profile</a>
              </div>
            </div>
          )}
          {githubError && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {githubError}</div>}
          {githubLoggedIn && (
            <form onSubmit={handleGithubConnect}>
              <div>
                <label>Owner: </label>
                <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. octocat" />
              </div>
              <div>
                <label>Repo: </label>
                <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="e.g. Hello-World" />
              </div>
              <div>
                <label>Username: </label>
                <input value={githubUsername} onChange={e => setGithubUsername(e.target.value)} placeholder="(optional, leave blank to use server default)" />
              </div>
              <div>
                <label>Token: </label>
                <input value={githubToken} onChange={e => setGithubToken(e.target.value)} placeholder="(optional, leave blank to use server default)" type="password" />
              </div>
              <button type="submit">Connect to GitHub</button>
            </form>
          )}
          {githubConnected && githubLoggedIn && <GitHubIssuesWidget owner={owner} repo={repo} error={githubError} />}
        </div>
        {/* Jira Card */}
        <div className="integration-card">
          <h3>Jira Integration</h3>
          {!jiraLoggedIn ? (
            <button onClick={handleJiraLogin} style={{ marginBottom: '1rem' }}>
              Login with Jira
            </button>
          ) : null}
          {jiraLoggedIn && jiraAccessToken && (
            <div style={{ marginBottom: '1rem', color: '#eebbc3' }}>
              <b>Jira Access Token:</b> {jiraAccessToken.slice(0, 8)}... (hidden)
            </div>
          )}
          {jiraError && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {jiraError}</div>}
          {jiraLoggedIn && (
            <form onSubmit={handleJiraConnect}>
              <div>
                <label>Domain: </label>
                <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. your-domain" />
              </div>
              <div>
                <label>Email: </label>
                <input value={jiraEmail} onChange={e => setJiraEmail(e.target.value)} placeholder="(optional, leave blank to use server default)" />
              </div>
              <div>
                <label>API Token: </label>
                <input value={jiraToken} onChange={e => setJiraToken(e.target.value)} placeholder="(optional, leave blank to use server default)" type="password" />
              </div>
              <button type="submit">Connect to Jira</button>
            </form>
          )}
          {jiraConnected && jiraLoggedIn && <JiraIssuesWidget domain={domain} error={jiraError} accessToken={jiraAccessToken} />}
        </div>
      </div>
    </div>
  );
};

export default Integrations; 