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

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box
      className="welcome-gradient-bg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      <Fade in timeout={1200}>
        <Paper
          elevation={8}
          className="card"
          sx={{
            p: isMobile ? 3 : 6,
            borderRadius: 5,
            textAlign: 'center',
            maxWidth: 480,
            width: '100%',
            backdropFilter: 'blur(8px)',
            zIndex: 2,
          }}
        >
          <Slide in direction="down" timeout={900}>
            <img
              src="/logo192.png"
              alt="Logo"
              style={{
                width: isMobile ? 60 : 90,
                marginBottom: isMobile ? 10 : 18,
                filter: 'drop-shadow(0 2px 8px #eebbc3)',
                transition: 'width 0.3s',
              }}
            />
          </Slide>
          <Typography
            variant={isMobile ? 'h4' : 'h3'}
            fontWeight={800}
            color="primary"
            gutterBottom
            sx={{ letterSpacing: 1 }}
          >
            Welcome to DevFlowHub
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            color="text.secondary"
            gutterBottom
            sx={{ mb: isMobile ? 2 : 3 }}
          >
            Supercharge your workflow with AI-powered insights and seamless collaboration.
          </Typography>
          <Stack
            direction="row"
            spacing={isMobile ? 1 : 2}
            justifyContent="center"
            sx={{ my: isMobile ? 1 : 3, flexWrap: 'wrap' }}
          >
            {features.map((f, i) => (
              <Fade in timeout={1000 + i * 200} key={f.label}>
                <Box display="flex" flexDirection="column" alignItems="center" mx={isMobile ? 0.5 : 1}>
                  {f.icon}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, fontSize: isMobile ? 11 : 13, fontWeight: 500 }}
                  >
                    {f.label}
                  </Typography>
                </Box>
              </Fade>
            ))}
          </Stack>
          <Slide in direction="up" timeout={1200}>
            <Button
              variant="contained"
              className="MuiButton-root"
              endIcon={<LoginIcon />}
              sx={{
                mt: isMobile ? 2 : 4,
                px: isMobile ? 3 : 5,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: isMobile ? 16 : 20,
              }}
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </Slide>
        </Paper>
      </Fade>
      {/* Animated background blobs */}
      <div className="welcome-bg-blob blob1" />
      <div className="welcome-bg-blob blob2" />
      <div className="welcome-bg-blob blob3" />
      {/* Subtle animated lines for extra interactivity */}
      <div className="welcome-animated-line line1" />
      <div className="welcome-animated-line line2" />
    </Box>
  );
};

export default Welcome;
