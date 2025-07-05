import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem, Avatar, Paper } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Docs from './pages/Docs';
import Learning from './pages/Learning';
import Insights from './pages/Insights';
import Integrations from './pages/Integrations';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import { AuthProvider, useAuth } from './context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#232946' },
    background: { default: '#181818', paper: '#232946' },
    text: { primary: '#fff', secondary: '#fff' },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const AppContent: React.FC = () => {
  const { isLoggedIn, userInfo, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  // Sidebar state
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const sidebarWidth = sidebarMinimized ? 60 : 240;

  // AppBar with profile button (only when logged in)
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };
  const handleLogout = async () => {
    await logout();
    handleClose();
    navigate('/auth');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
      }}
    >
      {isLoggedIn && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: 1201,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 2px 16px 0 #b8c1ec33',
            transition: 'margin-left 0.3s',
            ml: `${sidebarWidth}px`,
            width: { sm: `calc(100% - ${sidebarWidth}px)` },
          }}
          elevation={2}
        >
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}
            >
              DevFlowHub
            </Typography>
            <IconButton color="inherit" onClick={handleMenu} size="large">
              {userInfo && userInfo.avatar ? (
                <Avatar src={userInfo.avatar} alt="avatar" />
              ) : (
                <AccountCircle fontSize="large" />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      )}
      <Box
        sx={{
          display: 'flex',
          pt: isLoggedIn ? 8 : 0,
        }}
      >
        {isLoggedIn && (
          <Sidebar
            open={true}
            setOpen={() => {}}
            width={240}
            setWidth={() => {}}
            minWidth={180}
            maxWidth={400}
            minimized={sidebarMinimized}
            setMinimized={setSidebarMinimized}
          />
        )}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: isLoggedIn ? { xs: 2, sm: 5 } : 0,
            bgcolor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: isLoggedIn ? 'center' : 'flex-start',
            alignItems: isLoggedIn ? 'flex-start' : 'stretch',
            transition: 'padding 0.3s, margin-left 0.3s',
            ml: isLoggedIn ? `${sidebarWidth}px` : 0,
          }}
        >
          {isLoggedIn ? (
            <Paper
              elevation={6}
              sx={{
                width: '100%',
                minHeight: '80vh',
                p: { xs: 2, sm: 4 },
                borderRadius: 5,
                boxShadow: '0 8px 32px 0 rgba(31,38,135,0.17)',
                bgcolor: 'background.paper',
                mt: 2,
                transition: 'padding 0.3s, box-shadow 0.3s',
              }}
            >
              <Routes>
                {/* Protected routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/docs" element={<ProtectedRoute><Docs /></ProtectedRoute>} />
                <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Paper>
          ) : (
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const App: React.FC = () => (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
