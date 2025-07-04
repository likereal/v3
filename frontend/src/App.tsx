import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, IconButton, Typography, Box, Drawer, Menu, MenuItem, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, Divider, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import InsightsIcon from '@mui/icons-material/Insights';
import SearchIcon from '@mui/icons-material/Search';
import ExtensionIcon from '@mui/icons-material/Extension';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './App.css';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Docs from './pages/Docs';
import Learning from './pages/Learning';
import Team from './pages/Team';
import Insights from './pages/Insights';
import Search from './pages/Search';
import Integrations from './pages/Integrations';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

const drawerWidth = 240;
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#fff' },
    secondary: { main: '#232946' },
    background: { default: '#181818', paper: '#232946' },
    text: { primary: '#fff', secondary: '#fff' },
  },
});

const navLinks = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/projects', label: 'Projects', icon: <FolderOpenIcon /> },
  { to: '/docs', label: 'Docs', icon: <BookIcon /> },
  { to: '/learning', label: 'Learning', icon: <SchoolIcon /> },
  { to: '/team', label: 'Team', icon: <GroupIcon /> },
  { to: '/insights', label: 'Insights', icon: <InsightsIcon /> },
  { to: '/search', label: 'Search', icon: <SearchIcon /> },
  { to: '/integrations', label: 'Integrations', icon: <ExtensionIcon /> },
  { to: '/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

const App: React.FC = () => {
  const { user, userInfo, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: 48, pl: 1 }}>
        <IconButton onClick={() => setSidebarCollapsed(c => !c)} size="large" color="primary">
          {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navLinks.map(link => (
          <ListItem disablePadding key={link.to}>
            <ListItemButton onClick={() => { navigate(link.to); setMobileOpen(false); }} sx={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', px: sidebarCollapsed ? 1 : 2 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: sidebarCollapsed ? 0 : 2, justifyContent: 'center' }}>{link.icon}</ListItemIcon>
              {!sidebarCollapsed && <ListItemText primary={link.label} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: 1000, bgcolor: 'background.paper', color: 'text.primary', minHeight: 48 }}>
          <Toolbar variant="dense" sx={{ minHeight: 40, px: 1 }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                ml: { xs: 0, sm: sidebarCollapsed ? '64px' : '240px' },
                transition: 'margin-left 0.2s',
              }}
            >
              Dev Productivity Platform
            </Typography>
            <Box>
              <IconButton color="inherit" onClick={handleMenu} size="large">
                {userInfo && userInfo.avatar ? (
                  <Avatar src={userInfo.avatar} alt="avatar" />
                ) : (
                  <AccountCircle fontSize="large" />
                )}
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                {userInfo ? (
                  [
                    <MenuItem key="profile" onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>,
                    <MenuItem key="logout" onClick={async () => { await logout(); handleClose(); navigate('/auth'); }}>Logout</MenuItem>
                  ]
                ) : (
                  <MenuItem onClick={() => { navigate('/auth'); handleClose(); }}>Login / Register</MenuItem>
                )}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: sidebarCollapsed ? 64 : { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar navigation">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: sidebarCollapsed ? 64 : drawerWidth, transition: 'width 0.2s' } }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/team" element={<Team />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/search" element={<Search />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
