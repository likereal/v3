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
      <Paper elevation={6} sx={{
        p: 5,
        borderRadius: 4,
        textAlign: 'center',
        maxWidth: 400,
        width: '100%',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Registration is currently invite-only. Please contact the admin.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/auth')}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Signup;
