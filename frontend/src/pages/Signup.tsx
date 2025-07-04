import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
    }}>
      <Paper elevation={6} className="card" sx={{
        p: { xs: 3, sm: 6 },
        borderRadius: 6,
        textAlign: 'center',
        maxWidth: 700,
        width: '100%',
        margin: 'auto',
      }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Registration is currently invite-only. Please contact the admin.
        </Typography>
        <Button variant="contained" className="MuiButton-root" sx={{ mt: 2 }} onClick={() => navigate('/auth')}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Signup;
