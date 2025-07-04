import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardContent, List, ListItem, Divider, Typography, Avatar, CircularProgress, Box, IconButton, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  // GitHub notifications state
  const [githubEvents, setGithubEvents] = useState<any[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [githubExpanded, setGithubExpanded] = useState(true);

  // Jira notifications state
  const [jiraIssues, setJiraIssues] = useState<any[]>([]);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraExpanded, setJiraExpanded] = useState(true);

  const { userInfo, connectGithub, connectJira, disconnectGithub, disconnectJira, idToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo?.github) {
      setGithubLoading(true);
      setGithubError(null);
      // Fetch repo events (issues, PRs, merges, etc.)
      axios.get('https://api.github.com/repos/likereal/v3/events')
        .then(res => {
          setGithubEvents(res.data as any[]);
          setGithubLoading(false);
        })
        .catch(err => {
          setGithubError('Failed to fetch GitHub notifications');
          setGithubLoading(false);
        });
    }
  }, [userInfo?.github]);

  useEffect(() => {
    if (userInfo?.jira && idToken) {
      setJiraLoading(true);
      setJiraError(null);
      
      // Get selected project from localStorage
      const selectedProject = localStorage.getItem('selectedJiraProject');
      const url = selectedProject 
        ? `http://localhost:5000/api/jira/issues?project=${encodeURIComponent(selectedProject)}`
        : 'http://localhost:5000/api/jira/issues';
      
      // Fetch Jira issues assigned to the user
      axios.get(url, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      })
        .then(res => {
          setJiraIssues(res.data as any[]);
          setJiraLoading(false);
        })
        .catch(err => {
          setJiraError('Failed to fetch Jira notifications');
          setJiraLoading(false);
        });
    }
  }, [userInfo?.jira, idToken]);

  return (
    <Box className="Notifications-page" sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>Notifications</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        All your project and integration updates will appear here.
      </Typography>

      {/* GitHub Notifications Section */}
      <Card sx={{ mb: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {userInfo?.github && (
                <IconButton onClick={() => setGithubExpanded(exp => !exp)} sx={{ mr: 1 }}>
                  {githubExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              <Typography variant="h6" color="primary" fontWeight={600}>GitHub Notifications</Typography>
              <Box sx={{ flexGrow: 1 }} />
              {userInfo?.github ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={disconnectGithub}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => { if (!userInfo) { navigate('/auth'); } else { connectGithub(); } }}
                >
                  Connect GitHub
                </Button>
              )}
            </Box>
          }
        />
        {githubExpanded && (
          <CardContent sx={{ pt: 0 }}>
            {userInfo?.github ? (
              githubLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="primary" /></Box>
              ) : githubError ? (
                <Typography color="error">{githubError}</Typography>
              ) : githubEvents.length === 0 ? (
                <Typography color="text.secondary">No recent GitHub notifications found.</Typography>
              ) : (
                <List disablePadding>
                  {githubEvents.slice(0, 20).map((event, idx, arr) => (
                    <React.Fragment key={event.id}>
                      <ListItem sx={{ py: 1, px: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', display: 'inline' }}>{event.type.replace(/Event$/, '')}</Typography>
                          <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                            by {event.actor?.login || 'unknown'} on {event.repo?.name || 'repo'}
                          </Typography>
                          {event.payload && event.payload.pull_request && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              PR: <a href={event.payload.pull_request.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>{event.payload.pull_request.title}</a>
                            </Typography>
                          )}
                          {event.payload && event.payload.issue && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Issue: <a href={event.payload.issue.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>{event.payload.issue.title}</a>
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right', ml: 2 }}>
                          {event.created_at ? new Date(event.created_at).toLocaleString() : 'N/A'}
                        </Typography>
                      </ListItem>
                      {idx < arr.length - 1 && <Divider component="li" sx={{ bgcolor: 'secondary.main' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )
            ) : (
              <Typography color="primary">Connect GitHub to see notifications for your repositories.</Typography>
            )}
          </CardContent>
        )}
      </Card>

      {/* Jira Notifications Section */}
      <Card sx={{ mb: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {userInfo?.jira && (
                <IconButton onClick={() => setJiraExpanded(exp => !exp)} sx={{ mr: 1 }}>
                  {jiraExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
              <Typography variant="h6" color="primary" fontWeight={600}>Jira Notifications</Typography>
              <Box sx={{ flexGrow: 1 }} />
              {userInfo?.jira ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={disconnectJira}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  onClick={() => { if (!userInfo) { navigate('/auth'); } else { connectJira(); } }}
                >
                  Connect Jira
                </Button>
              )}
            </Box>
          }
        />
        {jiraExpanded && (
          <CardContent sx={{ pt: 0 }}>
            {userInfo?.jira ? (
              jiraLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="primary" /></Box>
              ) : jiraError ? (
                <Typography color="error">{jiraError}</Typography>
              ) : jiraIssues.length === 0 ? (
                <Typography color="text.secondary">No recent Jira issues found.</Typography>
              ) : (
                <List disablePadding>
                  {jiraIssues.slice(0, 20).map((issue, idx, arr) => (
                    <React.Fragment key={issue.id}>
                      <ListItem sx={{ py: 1, px: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', display: 'inline' }}>
                            {issue.key}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                            {issue.fields.summary}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            Status: {issue.fields.status.name} | 
                            {issue.fields.assignee && ` Assigned to: ${issue.fields.assignee.displayName} |`}
                            Created: {new Date(issue.fields.created).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right', ml: 2 }}>
                          {issue.fields.updated ? new Date(issue.fields.updated).toLocaleString() : 'N/A'}
                        </Typography>
                      </ListItem>
                      {idx < arr.length - 1 && <Divider component="li" sx={{ bgcolor: 'secondary.main' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )
            ) : (
              <Typography color="primary">Connect Jira to see your assigned issues and project updates.</Typography>
            )}
          </CardContent>
        )}
      </Card>
    </Box>
  );
};

export default Notifications; 