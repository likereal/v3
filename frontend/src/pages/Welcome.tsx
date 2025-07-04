import React from 'react';
import { Button, Typography, Box, Paper, Stack, Fade, Slide, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import LoginIcon from '@mui/icons-material/Login';
import './Welcome.css';

const features = [
  { icon: <RocketLaunchIcon color="primary" fontSize="large" />, label: 'Boost Productivity' },
  { icon: <GroupWorkIcon color="primary" fontSize="large" />, label: 'Team Collaboration' },
  { icon: <InsightsIcon color="primary" fontSize="large" />, label: 'Actionable Insights' },
  { icon: <SecurityIcon color="primary" fontSize="large" />, label: 'Secure & Reliable' },
];

const useCases = [
  {
    title: "AI-Powered Code Review",
    desc: "Get instant feedback and suggestions on your code with our integrated AI reviewer.",
    icon: "🤖"
  },
  {
    title: "Seamless Team Sync",
    desc: "Collaborate in real-time, assign tasks, and track progress with your team.",
    icon: "👥"
  },
  {
    title: "Smart Notifications",
    desc: "Never miss a beat—get notified about important updates, PRs, and deadlines.",
    icon: "🔔"
  },
  {
    title: "Unified Dashboard",
    desc: "See all your projects, issues, and learning resources in one place.",
    icon: "📊"
  }
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:900px)');

  return (
    <Box
      className="welcome-gradient-bg"
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        position: 'relative',
        overflow: 'hidden',
        px: 0,
      }}
    >
      {/* Left: Dialog Box */}
      <Box
        className="welcome-left-panel"
        sx={{
          flex: isMobile ? 'none' : '0 0 420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: isMobile ? '100%' : 420,
          zIndex: 2,
          height: isMobile ? 'auto' : '100vh',
        }}
      >
        <Fade in timeout={1200}>
          <Paper
            elevation={8}
            sx={{
              m: isMobile ? 2 : 6,
              p: isMobile ? 3 : 6,
              borderRadius: 5,
              textAlign: 'center',
              maxWidth: 420,
              width: '100%',
              bgcolor: 'rgba(35,41,70,0.95)',
              boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box mb={2}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width={70} style={{ filter: 'drop-shadow(0 0 12px #b8c1ec)' }} />
            </Box>
            <Typography variant="h3" fontWeight={900} color="white" gutterBottom>
              Welcome to <br />DevFlowHub
            </Typography>
            <Typography variant="h6" color="#b8c1ec" mb={3}>
              Supercharge your workflow with AI-powered insights and seamless collaboration.
            </Typography>
            <Stack direction="row" spacing={3} justifyContent="center" mb={3} flexWrap="wrap">
              {features.map(f => (
                <Box key={f.label} textAlign="center" minWidth={90}>
                  {f.icon}
                  <Typography variant="caption" color="#eebbc3" fontWeight={700} display="block" mt={1}>
                    {f.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<LoginIcon />}
              sx={{
                mt: 2,
                fontWeight: 700,
                fontSize: isMobile ? 16 : 20,
                boxShadow: '0 4px 24px 0 #eebbc355',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.07)' },
                background: 'linear-gradient(90deg, #eebbc3 0%, #b8c1ec 100%)',
                color: '#232946',
              }}
              onClick={() => navigate('/auth')}
              className="welcome-cta-btn"
            >
              Get Started
            </Button>
          </Paper>
        </Fade>
      </Box>

      {/* Right: Info, Use Cases, Animation */}
      <Box
        className="welcome-right-panel"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          minWidth: 0,
          height: isMobile ? 'auto' : '100vh',
          px: isMobile ? 2 : 8,
          py: isMobile ? 3 : 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Fade in timeout={1500}>
            <Paper
              elevation={0}
              sx={{
                p: isMobile ? 2 : 4,
                borderRadius: 5,
                maxWidth: 600,
                width: '100%',
                bgcolor: 'rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px 0 #b8c1ec22',
                backdropFilter: 'blur(4px)',
                textAlign: 'left',
              }}
            >
              <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                What can you do with DevFlowHub?
              </Typography>
              <Stack spacing={3} sx={{ mt: 2 }}>
                {useCases.map((uc, i) => (
                  <Slide in direction="right" timeout={1000 + i * 200} key={uc.title}>
                    <Box display="flex" alignItems="flex-start">
                      <span style={{
                        fontSize: 32,
                        marginRight: 16,
                        filter: 'drop-shadow(0 2px 8px #eebbc3)',
                        flexShrink: 0,
                        lineHeight: 1,
                      }}>{uc.icon}</span>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          {uc.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {uc.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Slide>
                ))}
              </Stack>
            </Paper>
          </Fade>
          {/* Animation here */}
          <Fade in timeout={2000}>
            <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <svg width="220" height="120" viewBox="0 0 220 120" fill="none" style={{ opacity: 0.7 }}>
                <ellipse cx="110" cy="60" rx="100" ry="40" fill="#b8c1ec" filter="url(#blur)" />
                <animate attributeName="rx" values="100;110;100" dur="3s" repeatCount="indefinite" />
                <defs>
                  <filter id="blur">
                    <feGaussianBlur stdDeviation="18" />
                  </filter>
                </defs>
              </svg>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* Animated background blobs and lines */}
      <div className="welcome-bg-blob blob1" />
      <div className="welcome-bg-blob blob2" />
      <div className="welcome-bg-blob blob3" />
      <div className="welcome-animated-line line1" />
      <div className="welcome-animated-line line2" />
    </Box>
  );
};

export default Welcome;
