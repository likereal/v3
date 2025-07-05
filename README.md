# Developer Productivity Platform

A modern, integrated developer productivity platform that unifies project management, version control, documentation, and learning resources into a single, cohesive interface. Built with React, Node.js, and Firebase.

## 🚀 Features

### 🔗 **Integrated Tool Connections**
- **GitHub Integration**: Connect your GitHub account to view repositories, issues, pull requests, commits, and contributors
- **Jira Integration**: Connect your Jira account to view projects, issues, user stories, and project updates
- **Firebase Authentication**: Secure user authentication with Google Firebase

### 📊 **Dashboard & Analytics**
- **Unified Dashboard**: View all your project information in one place
- **Code Insights**: Real-time GitHub repository analytics including:
  - Repository statistics (stars, forks, watchers)
  - Language breakdown with file sizes
  - Recent commits with clickable links
  - Top contributors with avatars
  - Open/closed issues and pull requests
- **Jira Project Management**: 
  - View assigned issues and user stories
  - Filter by selected project
  - Clickable issue links to Jira board
  - Color-coded issue types (purple for user stories, green for issues)

### 🔔 **Smart Notifications**
- **Expandable Notifications**: Collapsible notification items showing only headers when collapsed
- **GitHub Notifications**: 
  - Pull request updates with clickable links
  - Issue updates with clickable links
  - Push events with clickable commit links (showing first 5 characters of SHA)
  - Branch information for push events
- **Jira Notifications**: 
  - Issue and user story updates
  - Project-filtered notifications
  - Clickable links to Jira board

### 🤖 **AI-Powered Chatbot**
- **Gemini AI Integration**: Powered by Google's Gemini AI
- **Context-Aware Responses**: Understands your project context and codebase
- **Real-time Chat**: Interactive chat interface in the Insights page
- **Error Handling**: Robust error handling with fallback responses

### 📚 **Learning & Documentation**
- **Learning Resources**: YouTube video integration for technical learning
- **Documentation Access**: Quick access to project documentation
- **Learning Progress Tracking**: Track your daily learning hours
- **Search & Discovery**: Find relevant learning content

### 🎨 **Modern UI/UX**
- **Dark Theme**: Modern dark theme with consistent styling
- **Responsive Design**: Works on desktop and mobile devices
- **Material-UI Components**: Professional UI components
- **Smooth Animations**: Expandable sections and smooth transitions

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Firebase Auth** for authentication

### Backend
- **Node.js** with Express
- **Firebase Admin SDK** for authentication
- **GitHub API** integration
- **Jira API** integration
- **Google Gemini AI** for chatbot
- **CORS** enabled for cross-origin requests

### Authentication & Database
- **Firebase Authentication** (Google OAuth)
- **Firestore** for user data storage
- **JWT tokens** for API authentication

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **GitHub Personal Access Token** (for GitHub API)
- **Firebase Project** with Authentication and Firestore enabled
- **Jira OAuth App** (for Jira integration)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd v3
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here

# Jira Configuration
JIRA_CLIENT_ID=your_jira_client_id_here
JIRA_CLIENT_SECRET=your_jira_client_secret_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id

# Server Configuration
PORT=5000
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Google provider)
4. Enable Firestore Database
5. Download your service account key and save as `v3hackathon-firebase-adminsdk-fbsvc-365348b3fc.json` in the backend directory

### 5. GitHub Token Setup

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Generate a new Personal Access Token (classic)
3. Select scopes: `public_repo` (or `repo` for private repos)
4. Copy the token and add it to your backend `.env` file

### 6. Jira OAuth Setup

1. Go to your Jira instance > Settings > Apps > Manage apps
2. Create a new OAuth app
3. Set callback URL to `http://localhost:5000/auth/jira/callback`
4. Copy Client ID and Secret to your backend `.env` file

### 7. Start the Application

```bash
# Start backend server (from backend directory)
cd backend
npm start

# Start frontend development server (from frontend directory)
cd ../frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### First Time Setup

1. **Open the application** at http://localhost:3000
2. **Sign in** using your Google account
3. **Connect GitHub**: Click "Connect GitHub" to link your GitHub account
4. **Connect Jira**: Click "Connect Jira" to link your Jira account
5. **Start exploring**: Your dashboard will populate with your project data

### Dashboard Features

- **Tasks & Projects**: View your Jira issues and user stories
- **Code Insights**: See GitHub repository analytics and recent activity
- **Documentation**: Access project documentation and learning resources
- **Learning Resources**: Track your learning progress and find new content

### Notifications

- **Expandable Items**: Click on notification items to expand/collapse details
- **Clickable Links**: All GitHub and Jira items are clickable and open in new tabs
- **Real-time Updates**: Notifications update automatically when you refresh

### AI Chatbot

- **Access**: Go to the Insights page
- **Ask Questions**: Ask about your code, projects, or technical topics
- **Context Aware**: The chatbot understands your project context

## 🔧 API Endpoints

### GitHub Endpoints
- `GET /api/github/issues` - Get repository issues
- `GET /api/github/repo` - Get repository details
- `GET /api/github/commits` - Get recent commits
- `GET /api/github/contributors` - Get repository contributors
- `GET /api/github/languages` - Get language breakdown

### Jira Endpoints
- `GET /api/jira/issues` - Get Jira issues
- `GET /api/jira/user-stories` - Get Jira user stories
- `GET /api/jira/projects` - Get Jira projects

### Authentication Endpoints
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/jira` - Jira OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/jira/callback` - Jira OAuth callback

## 🐛 Troubleshooting

### Common Issues

1. **GitHub Rate Limit Error**
   - Solution: Set `GITHUB_TOKEN` in your backend `.env` file
   - Get a token from GitHub Settings > Developer settings > Personal access tokens

2. **Firebase Authentication Error**
   - Check your Firebase configuration in frontend `.env`
   - Ensure Firebase project has Authentication enabled

3. **Jira Connection Issues**
   - Verify Jira OAuth app configuration
   - Check callback URLs match exactly

4. **Backend Server Not Starting**
   - Check if port 5000 is available
   - Verify all environment variables are set
   - Check Firebase service account file exists

### Debug Mode

To enable debug logging, add to your backend `.env`:
```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Material-UI** for the beautiful UI components
- **Firebase** for authentication and database
- **GitHub API** for repository data
- **Jira API** for project management
- **Google Gemini AI** for intelligent chatbot functionality

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all environment variables are properly set
4. Verify all API tokens are valid and have correct permissions

---

**Happy Coding! 🚀** 