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
  const [jiraBaseUrl, setJiraBaseUrl] = useState<string | null>(null);
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraExpanded, setJiraExpanded] = useState(true);
  const [jiraUserStories, setJiraUserStories] = useState<any[]>([]);
  const [jiraUserStoriesLoading, setJiraUserStoriesLoading] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const { userInfo, connectGithub, connectJira, disconnectGithub, disconnectJira, idToken } = useAuth();
  const navigate = useNavigate();

  // Helper function to toggle notification expansion
  const toggleNotification = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

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
          // Handle both old format (array) and new format (object with issues and jiraBaseUrl)
          if (Array.isArray(res.data)) {
            setJiraIssues(res.data);
            setJiraBaseUrl(null);
          } else {
            setJiraIssues(res.data.issues || []);
            setJiraBaseUrl(res.data.jiraBaseUrl || null);
          }
          setJiraLoading(false);
        })
        .catch(err => {
          setJiraError('Failed to fetch Jira notifications');
          setJiraLoading(false);
        });
    }
  }, [userInfo?.jira, idToken]);

  // Fetch Jira user stories
  useEffect(() => {
    if (userInfo?.jira && idToken) {
      setJiraUserStoriesLoading(true);
      // Get selected project from localStorage
      const selectedProject = localStorage.getItem('selectedJiraProject');
      const url = selectedProject 
        ? `http://localhost:5000/api/jira/user-stories?project=${encodeURIComponent(selectedProject)}`
        : 'http://localhost:5000/api/jira/user-stories';
      // Fetch Jira user stories
      axios.get(url, {
        headers: { Authorization: `Bearer ${idToken}` },
        withCredentials: true
      })
        .then(res => {
          // Handle both old format (array) and new format (object with userStories and jiraBaseUrl)
          if (Array.isArray(res.data)) {
            setJiraUserStories(res.data);
          } else {
            setJiraUserStories(res.data.userStories || []);
          }
          setJiraUserStoriesLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch Jira user stories:', err);
          setJiraUserStoriesLoading(false);
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
                  onClick={() => { if (!userInfo) { navigate('/profile'); } else { connectGithub(); } }}
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
                      <ListItem sx={{ py: 1, px: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleNotification(event.id)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <IconButton 
                            size="small" 
                            sx={{ mr: 1, color: 'primary.main', p: 0.5, minWidth: 'auto', width: '20px', height: '20px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNotification(event.id);
                            }}
                          >
                            {expandedNotifications.has(event.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', display: 'inline' }}>{event.type.replace(/Event$/, '')}</Typography>
                            <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                              by {event.actor?.login || 'unknown'} on {event.repo?.name || 'repo'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right', ml: 2 }}>
                            {event.created_at ? new Date(event.created_at).toLocaleString() : 'N/A'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {expandedNotifications.has(event.id) && (
                        <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                          <Box>
                            {event.payload && event.payload.pull_request && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                PR: <a href={event.payload.pull_request.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', fontWeight: 600, textDecoration: 'underline' }}>{event.payload.pull_request.title}</a>
                              </Typography>
                            )}
                            {event.payload && event.payload.issue && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Issue: <a href={event.payload.issue.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', fontWeight: 600, textDecoration: 'underline' }}>{event.payload.issue.title}</a>
                              </Typography>
                            )}
                            {event.type === 'PushEvent' && event.payload && event.payload.commits && event.payload.commits.length > 0 && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Commits: {event.payload.commits.map((commit: any, index: number) => (
                                  <span key={index}>
                                    <a 
                                      href={`https://github.com/${event.repo?.name}/commit/${commit.sha}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      style={{ color: '#4CAF50', fontWeight: 600, textDecoration: 'underline' }}
                                    >
                                      {commit.sha.substring(0, 5)}: {commit.message}
                                    </a>
                                    {index < event.payload.commits.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </Typography>
                            )}
                            {event.type === 'PushEvent' && event.payload && event.payload.ref && (
                              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                Branch: <span style={{ color: '#4CAF50', fontWeight: 600 }}>{event.payload.ref.replace('refs/heads/', '')}</span>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
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
                  onClick={() => { if (!userInfo) { navigate('/profile'); } else { connectJira(); } }}
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
              (jiraLoading || jiraUserStoriesLoading) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="primary" /></Box>
              ) : jiraError ? (
                <Typography color="error">{jiraError}</Typography>
              ) : (jiraIssues.length === 0 && jiraUserStories.length === 0) ? (
                <Typography color="text.secondary">No recent Jira notifications found.</Typography>
              ) : (
                <List disablePadding>
                  {/* Combine and sort all Jira items by updated date */}
                  {[...jiraIssues, ...jiraUserStories]
                    .sort((a, b) => new Date(b.fields.updated).getTime() - new Date(a.fields.updated).getTime())
                    .slice(0, 20)
                    .map((item, idx, arr) => {
                      const isUserStory = item.fields.issuetype?.name === 'Story';
                      const linkColor = isUserStory ? '#9C27B0' : '#4CAF50';
                      return (
                        <React.Fragment key={item.id}>
                          <ListItem sx={{ py: 1, px: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleNotification(item.id)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <IconButton 
                                size="small" 
                                sx={{ mr: 1, color: 'primary.main', p: 0.5, minWidth: 'auto', width: '20px', height: '20px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNotification(item.id);
                                }}
                              >
                                {expandedNotifications.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              <Box sx={{ flexGrow: 1 }}>
                                {jiraBaseUrl ? (
                                  <a
                                    href={`${jiraBaseUrl}/browse/${item.key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: linkColor, fontWeight: 600, textDecoration: 'underline', marginRight: 8 }}
                                  >
                                    {item.key}
                                  </a>
                                ) : (
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', display: 'inline' }}>{item.key}</Typography>
                                )}
                                <Typography variant="body2" sx={{ display: 'inline', ml: 1 }}>
                                  {item.fields.summary}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, textAlign: 'right', ml: 2 }}>
                                {item.fields.updated ? new Date(item.fields.updated).toLocaleString() : 'N/A'}
                              </Typography>
                            </Box>
                          </ListItem>
                          {expandedNotifications.has(item.id) && (
                            <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                  Type: {item.fields.issuetype?.name} | Status: {item.fields.status.name} | 
                                  {item.fields.assignee && ` Assigned to: ${item.fields.assignee.displayName} |`}
                                  Created: {new Date(item.fields.created).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          {idx < arr.length - 1 && <Divider component="li" sx={{ bgcolor: 'secondary.main' }} />}
                        </React.Fragment>
                      );
                    })}
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