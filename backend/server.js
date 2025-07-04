const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');
const OAuth2Strategy = require('passport-oauth2');
const admin = require('firebase-admin');
const serviceAccount = require('./v3hackathon-firebase-adminsdk-fbsvc-365348b3fc.json');
const MemoryStore = require('memorystore')(session);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- TEST FIRESTORE ROUTE ---
app.get('/test-firestore', async (req, res) => {
  try {
    await db.collection('test').add({ hello: 'world', ts: new Date() });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'lax' },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}));
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

// Jira OAuth2 Strategy with rotating refresh token support
passport.use('jira', new OAuth2Strategy({
  authorizationURL: process.env.JIRA_AUTH_URL || 'https://auth.atlassian.com/authorize',
  tokenURL: process.env.JIRA_TOKEN_URL || 'https://auth.atlassian.com/oauth/token',
  clientID: process.env.JIRA_CLIENT_ID,
  clientSecret: process.env.JIRA_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/jira/callback',
  state: false, // Disable automatic state verification since we're using Firebase token as state
  scope: ['read:me','read:jira-work','read:jira-user', 'offline_access']
}, async (accessToken, refreshToken, params, profile, done) => {
  try {
    // Fetch Jira user info
    const meRes = await axios.get('https://api.atlassian.com/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    // Handle rotating refresh token - store the new refresh token
    const tokenData = {
      profile: meRes.data,
      accessToken,
      refreshToken,
      tokenExpiry: params.expires_in ? Date.now() + (params.expires_in * 1000) : null,
      tokenType: params.token_type || 'Bearer'
    };
    
    return done(null, tokenData);
  } catch (e) {
    return done(e);
  }
}));

app.get('/', (req, res) => {
  console.log('Failure redirect hit: OAuth authentication failed or was cancelled.');
  res.json({ message: 'Welcome to the Dev Productivity Platform API!' });
});



// GitHub Issues Route (dynamic)
app.get('/api/github/issues', async (req, res) => {
  const { owner, repo, token } = req.query;
  if (!owner || !repo) {
    console.error('Missing owner or repo');
    return res.status(400).json({ error: 'Missing owner or repo' });
  }
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    } else if (process.env.GITHUB_TOKEN) {
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

// GitHub OAuth
app.get('/auth/github', (req, res, next) => {
  const state = req.query.state;
  passport.authenticate('github', { scope: [ 'user:email', 'repo' ], state })(req, res, next);
});

// Jira OAuth2 login
app.get('/auth/jira', (req, res, next) => {
  const state = req.query.state;
  passport.authenticate('jira', {
    state: state // Pass the Firebase token as state parameter
  })(req, res, next);
});

// --- FIREBASE AUTH MIDDLEWARE ---
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUid = decoded.uid;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
}

// --- UPDATE GITHUB OAUTH CALLBACK ---
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  async (req, res) => {
    // Expect frontend to send Firebase ID token as the OAuth state param
    const firebaseIdToken = req.query.state;
    let firebaseUid = null;
    if (firebaseIdToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(firebaseIdToken);
        firebaseUid = decoded.uid;
        console.log('[GitHub Callback] Decoded Firebase UID:', firebaseUid);
      } catch (e) {
        console.error('[GitHub Callback] Invalid Firebase ID token:', e);
      }
    } else {
      console.warn('[GitHub Callback] No firebaseToken (state) param received.');
    }
    try {
      const profile = req.user.profile;
      const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || profile.email || profile.username || profile.login;
      if (firebaseUid) {
        console.log('[GitHub Callback] Attempting to save user to Firestore:', firebaseUid, email);
        await db.collection('users').doc(firebaseUid).set({
          provider: 'github',
          name: profile.displayName || profile.username || profile.login,
          email,
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          github: {
            accessToken: req.user.accessToken
          },
          updatedAt: new Date()
        }, { merge: true });
        console.log('[GitHub Callback] User saved to Firestore:', firebaseUid);
      } else {
        console.warn('[GitHub Callback] No Firebase UID, not saving user to Firestore.');
      }
    } catch (e) {
      console.error('[GitHub Callback] Failed to save GitHub user to Firestore:', e);
    }
    res.redirect('http://localhost:3000');
  }
);

app.get('/auth/github/user', (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.profile) {
    const profile = req.user.profile;
    res.json({
      login: profile.username || profile.login,
      avatar_url: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      html_url: profile.profileUrl || (profile._json && profile._json.html_url) || '',
      email: (profile.emails && profile.emails[0] && profile.emails[0].value) || profile.email || '',
      name: profile.displayName || profile.username || profile.login
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Add logout endpoint for both GitHub and Jira
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ success: true, message: 'Logged out from all services.' });
    });
  });
});

// Disconnect GitHub endpoint
app.post('/auth/disconnect/github', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    await db.collection('users').doc(uid).update({
      github: null,
      updatedAt: new Date()
    });
    res.json({ success: true, message: 'GitHub disconnected successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to disconnect GitHub' });
  }
});

// Disconnect Jira endpoint
app.post('/auth/disconnect/jira', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    await db.collection('users').doc(uid).update({
      jira: null,
      updatedAt: new Date()
    });
    res.json({ success: true, message: 'Jira disconnected successfully.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to disconnect Jira' });
  }
});

// Restore OAuth session from Firestore tokens after Firebase login
app.post('/auth/restore', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      // No user doc yet, but that's OK for new users
      return res.json({ success: true, message: 'No user doc yet' });
    }
    const userData = doc.data();
    
    // Set up Passport session for GitHub (Jira doesn't use Passport sessions)
    if (userData.github && userData.github.accessToken) {
      req.session.passport = req.session.passport || {};
      req.session.passport.user = req.session.passport.user || {};
      req.session.passport.user.profile = req.session.passport.user.profile || {};
      req.session.passport.user.accessToken = userData.github.accessToken;
      req.user = req.user || {};
      req.user.profile = req.user.profile || {};
      req.user.accessToken = userData.github.accessToken;
    }
    
    // Note: Jira tokens are stored in Firestore and accessed via Firebase token
    // No session restoration needed for Jira as it uses direct API calls
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to restore session' });
  }
});

app.get('/api/user', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      // Return a default user object if not found
      return res.json({ uid });
    }
    res.json(doc.data());
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// Jira OAuth2 callback
app.get('/auth/jira/callback',
  (req, res, next) => {
    // Check if there's an error in the callback URL
    if (req.query.error) {
      const errorMsg = `${req.query.error}: ${req.query.error_description || 'Unknown error'}`;
      return res.status(401).send(`<!DOCTYPE html><html><head><title>Jira Auth Failed</title></head><body><h2>Jira Authentication Failed</h2><p>${errorMsg}</p><a href='http://localhost:3000'>Back to App</a></body></html>`);
    }
    
    // Custom failure handler to show error message
    passport.authenticate('jira', (err, user, info) => {
      if (err || !user) {
        const errorMsg = err ? err.message : (info && info.message) || 'Jira authentication failed.';
        return res.status(401).send(`<!DOCTYPE html><html><head><title>Jira Auth Failed</title></head><body><h2>Jira Authentication Failed</h2><p>${errorMsg}</p><a href='http://localhost:3000'>Back to App</a></body></html>`);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.status(401).send(`<!DOCTYPE html><html><head><title>Jira Auth Failed</title></head><body><h2>Jira Authentication Failed</h2><p>${loginErr.message}</p><a href='http://localhost:3000'>Back to App</a></body></html>`);
        }
        next();
      });
    })(req, res, next);
  },
  async (req, res) => {
    const firebaseIdToken = req.query.state;
    let firebaseUid = null;
    if (firebaseIdToken) {
      try {
        const decoded = await admin.auth().verifyIdToken(firebaseIdToken);
        firebaseUid = decoded.uid;
      } catch (e) {
        console.error('[Jira Callback] Invalid Firebase ID token:', e);
      }
    }
    try {
      if (firebaseUid) {
        // Save Jira access token and user info with rotating refresh token support
        const userDocRef = db.collection('users').doc(firebaseUid);
        await userDocRef.set({
          jira: {
            accessToken: req.user.accessToken,
            refreshToken: req.user.refreshToken || null,
            tokenExpiry: req.user.tokenExpiry || null,
            tokenType: req.user.tokenType || 'Bearer',
            user: req.user.profile
          },
          updatedAt: new Date()
        }, { merge: true });
      }
    } catch (e) {
      console.error('[Jira Callback] Failed to save Jira user info:', e);
    }
    res.redirect('http://localhost:3000');
  }
);

// Endpoint to get Jira user info
app.get('/api/jira/user', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists || !doc.data().jira || !doc.data().jira.user) {
      // Return empty object if Jira user info not found
      return res.json({});
    }
    res.json(doc.data().jira.user);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch Jira user info' });
  }
});

// Helper function to refresh Jira token if needed
async function refreshJiraTokenIfNeeded(uid, jiraData) {
  // Check if token is expired or will expire soon (within 5 minutes)
  if (jiraData.tokenExpiry && Date.now() > (jiraData.tokenExpiry - 300000)) {
    try {
      const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        refresh_token: jiraData.refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;
      
      // Update the stored tokens
      await db.collection('users').doc(uid).update({
        'jira.accessToken': access_token,
        'jira.refreshToken': refresh_token,
        'jira.tokenExpiry': expires_in ? Date.now() + (expires_in * 1000) : null,
        'jira.tokenType': token_type || 'Bearer',
        updatedAt: new Date()
      });

      return access_token;
    } catch (e) {
      throw new Error('Failed to refresh Jira token');
    }
  }
  return jiraData.accessToken;
}

// Endpoint to get Jira projects
app.get('/api/jira/projects', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists || !doc.data().jira || !doc.data().jira.accessToken) {
      return res.json([]);
    }

    const jiraData = doc.data().jira;
    
    // Refresh token if needed
    const accessToken = await refreshJiraTokenIfNeeded(uid, jiraData);
    
    // First, get the user's accessible Jira sites
    const sitesRes = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!sitesRes.data || sitesRes.data.length === 0) {
      return res.json([]);
    }
    
    // Use the first accessible site (usually the user's primary Jira instance)
    const jiraSite = sitesRes.data[0];
    const jiraBaseUrl = jiraSite.url;
    
    // Get user's accessible projects
    // For Jira Cloud, we need to use the cloud ID instead of the URL
    const cloudId = jiraSite.id;
    console.log('[Jira Projects] Using cloud ID:', cloudId);
    
    const projectsRes = await axios.get(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    res.json(projectsRes.data);
  } catch (e) {
    console.error('[Jira Projects] Error:', e.response?.data || e.message);
    
    // Handle specific authentication errors
    if (e.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Jira authentication failed. Please reconnect your Jira account.',
        code: 'AUTH_FAILED'
      });
    }
    
    if (e.response?.status === 403) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to access Jira. Please check your Jira permissions.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch Jira projects' });
  }
});

// Endpoint to get Jira issues
app.get('/api/jira/issues', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  const { project } = req.query; // Get project parameter from query
  
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.json([]);
    }
    
    const userData = doc.data();
    if (!userData.jira || !userData.jira.accessToken) {
      return res.json([]);
    }

    const jiraData = userData.jira;
    
    // Refresh token if needed
    const accessToken = await refreshJiraTokenIfNeeded(uid, jiraData);
    
    // First, get the user's accessible Jira sites
    const sitesRes = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!sitesRes.data || sitesRes.data.length === 0) {
      return res.json([]);
    }
    
    // Use the first accessible site (usually the user's primary Jira instance)
    const jiraSite = sitesRes.data[0];
    const jiraBaseUrl = jiraSite.url;
    
    // For Jira Cloud, we need to use the cloud ID instead of the URL
    const cloudId = jiraSite.id;
    
    // Build JQL query based on project parameter
    let jql = '';
    if (project) {
      jql = `project = "${project}" ORDER BY updated DESC`;
    } else {
      jql = 'assignee = currentUser() ORDER BY updated DESC';
    }
    
    const issuesRes = await axios.get(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      params: {
        jql: jql,
        maxResults: 20,
        fields: 'summary,status,assignee,created,updated,project,priority,issuetype'
      }
    });
    
    res.json(issuesRes.data.issues || []);
  } catch (e) {
    // Handle specific authentication errors
    if (e.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Jira authentication failed. Please reconnect your Jira account.',
        code: 'AUTH_FAILED'
      });
    }
    
    if (e.response?.status === 403) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to access Jira. Please check your Jira permissions.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch Jira issues' });
  }
});

// Endpoint to refresh Jira access token
app.post('/api/jira/refresh-token', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists || !doc.data().jira || !doc.data().jira.refreshToken) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const jiraData = doc.data().jira;
    
    // Exchange refresh token for new access token
    const tokenResponse = await axios.post('https://auth.atlassian.com/oauth/token', {
      grant_type: 'refresh_token',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      refresh_token: jiraData.refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;
    
    // Update the stored tokens
    await db.collection('users').doc(uid).update({
      'jira.accessToken': access_token,
      'jira.refreshToken': refresh_token, // New rotating refresh token
      'jira.tokenExpiry': expires_in ? Date.now() + (expires_in * 1000) : null,
      'jira.tokenType': token_type || 'Bearer',
      updatedAt: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      expiresIn: expires_in
    });
  } catch (e) {
    console.error('[Jira Token Refresh] Error:', e.response?.data || e.message);
    res.status(500).json({ 
      error: 'Failed to refresh token',
      details: e.response?.data || e.message
    });
  }
});

// Test endpoint to check Jira connection status
app.get('/api/jira/test', verifyFirebaseToken, async (req, res) => {
  const uid = req.firebaseUid;
  
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) {
      return res.json({ 
        connected: false, 
        error: 'No user document found' 
      });
    }
    
    const userData = doc.data();
    if (!userData.jira || !userData.jira.accessToken) {
      return res.json({ 
        connected: false, 
        error: 'No Jira data found' 
      });
    }

    const jiraData = userData.jira;
    
    // Test the token by calling the accessible resources endpoint
    const testRes = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
      headers: { 
        Authorization: `Bearer ${jiraData.accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    res.json({ 
      connected: true, 
      accessibleSites: testRes.data,
      user: jiraData.user
    });
  } catch (e) {
    res.json({ 
      connected: false, 
      error: e.response?.data || e.message,
      status: e.response?.status
    });
  }
});

// Web Docs Search Endpoint
app.get('/api/webdocs', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const endpoint = 'https://api.duckduckgo.com/';

  try {
    const response = await axios.get(endpoint, {
      params: { q: query, format: 'json', no_redirect: 1, no_html: 1 },
    });
    const data = response.data;
    const docs = [];
    // Main result
    if (data.Heading && data.AbstractURL) {
      docs.push({
        title: data.Heading,
        description: data.Abstract || data.AbstractText || '',
        url: data.AbstractURL,
      });
    }
    // Related topics
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          docs.push({
            title: topic.Text,
            description: '',
            url: topic.FirstURL,
          });
        } else if (Array.isArray(topic.Topics)) {
          topic.Topics.forEach(subtopic => {
            if (subtopic.Text && subtopic.FirstURL) {
              docs.push({
                title: subtopic.Text,
                description: '',
                url: subtopic.FirstURL,
              });
            }
          });
        }
      });
    }
    res.json({ docs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch web docs', details: error.message });
  }
});

// Web Docs Search Endpoint
app.get('/api/webdocs', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const endpoint = 'https://api.duckduckgo.com/';

  try {
    const response = await axios.get(endpoint, {
      params: { q: query, format: 'json', no_redirect: 1, no_html: 1 },
    });
    const data = response.data;
    const docs = [];
    // Main result
    if (data.Heading && data.AbstractURL) {
      docs.push({
        title: data.Heading,
        description: data.Abstract || data.AbstractText || '',
        url: data.AbstractURL,
      });
    }
    // Related topics
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          docs.push({
            title: topic.Text,
            description: '',
            url: topic.FirstURL,
          });
        } else if (Array.isArray(topic.Topics)) {
          topic.Topics.forEach(subtopic => {
            if (subtopic.Text && subtopic.FirstURL) {
              docs.push({
                title: subtopic.Text,
                description: '',
                url: subtopic.FirstURL,
              });
            }
          });
        }
      });
    }
    res.json({ docs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch web docs', details: error.message });
  }
});

// Web Docs Search Endpoint
app.get('/api/webdocs', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const endpoint = 'https://api.duckduckgo.com/';

  try {
    const response = await axios.get(endpoint, {
      params: { q: query, format: 'json', no_redirect: 1, no_html: 1 },
    });
    const data = response.data;
    const docs = [];
    // Main result
    if (data.Heading && data.AbstractURL) {
      docs.push({
        title: data.Heading,
        description: data.Abstract || data.AbstractText || '',
        url: data.AbstractURL,
      });
    }
    // Related topics
    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          docs.push({
            title: topic.Text,
            description: '',
            url: topic.FirstURL,
          });
        } else if (Array.isArray(topic.Topics)) {
          topic.Topics.forEach(subtopic => {
            if (subtopic.Text && subtopic.FirstURL) {
              docs.push({
                title: subtopic.Text,
                description: '',
                url: subtopic.FirstURL,
              });
            }
          });
        }
      });
    }
    res.json({ docs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch web docs', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});