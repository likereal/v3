const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const OAuth2Strategy = require('passport-oauth2');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Save accessToken and profile as needed
    return done(null, { profile, accessToken });
  }
));

// Jira OAuth2 Strategy
passport.use('jira', new OAuth2Strategy({
  authorizationURL: 'https://auth.atlassian.com/authorize',
  tokenURL: 'https://auth.atlassian.com/oauth/token',
  clientID: process.env.JIRA_CLIENT_ID,
  clientSecret: process.env.JIRA_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/jira/callback',
  scope: ['offline_access', 'read:jira-user', 'read:jira-work'],
  state: true
},
(accessToken, refreshToken, params, profile, done) => {
  // Save accessToken in session
  return done(null, { accessToken });
}
));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Dev Productivity Platform API!' });
});

// GitHub Issues Route (dynamic)
app.get('/api/github/issues', async (req, res) => {
  const { owner, repo } = req.query;
  if (!owner || !repo) {
    console.error('Missing owner or repo');
    return res.status(400).json({ error: 'Missing owner or repo' });
  }
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      { headers }
    );
    res.json(response.data);
  } catch (error) {
    // Log the full error object for debugging
    console.error('GitHub API error:', error.response ? error.response.data : error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Jira Issues Route (dynamic)
app.get('/api/jira/issues', async (req, res) => {
  const { domain, jql, email, token } = req.query;
  if (!domain) {
    return res.status(400).json({ error: 'Missing Jira domain' });
  }
  let jiraToken = token || process.env.JIRA_API_TOKEN;
  let jiraEmail = email || process.env.JIRA_EMAIL;
  // If OAuth token is present in session, use it
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    jiraToken = req.user.accessToken;
    jiraEmail = undefined; // Not needed for OAuth2
  }
  if (!jiraToken) {
    return res.status(400).json({ error: 'Missing Jira API token or OAuth token' });
  }
  try {
    const headers = {
      Accept: 'application/json',
    };
    if (req.isAuthenticated() && req.user && req.user.accessToken) {
      headers['Authorization'] = `Bearer ${jiraToken}`;
    } else {
      headers['Authorization'] = `Basic ${Buffer.from(
        jiraEmail + ':' + jiraToken
      ).toString('base64')}`;
    }
    const response = await axios.get(
      `https://${domain}.atlassian.net/rest/api/3/search`,
      {
        headers,
        params: {
          jql: jql || 'assignee=currentUser()',
        },
      }
    );
    res.json(response.data.issues);
  } catch (error) {
    console.error('Jira API error:', error.response ? error.response.data : error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data.errorMessages ? error.response.data.errorMessages.join(', ') : error.response.data.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email', 'repo' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend or send token
    res.redirect('http://localhost:3000'); // or send user info/token
  }
);

app.get('/auth/github/user', (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.profile) {
    // Return the GitHub profile info
    res.json({
      login: req.user.profile.username || req.user.profile.login,
      avatar_url: req.user.profile.photos && req.user.profile.photos[0] ? req.user.profile.photos[0].value : '',
      html_url: req.user.profile.profileUrl || req.user.profile._json.html_url || '',
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/auth/jira', passport.authenticate('jira'));

app.get('/auth/jira/callback',
  passport.authenticate('jira', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect('http://localhost:3000');
  }
);

app.get('/auth/jira/token', (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    res.json({ accessToken: req.user.accessToken });
  } else {
    res.status(401).json({ error: 'Not authenticated with Jira' });
  }
});

app.get('/auth/jira/user', async (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    try {
      const response = await axios.get('https://api.atlassian.com/me', {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
          Accept: 'application/json',
        },
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch Jira user info' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated with Jira' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 