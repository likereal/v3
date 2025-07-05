import React from 'react';
import CodeReviewChatbot from '../components/CodeReviewChatbot';
import { Box } from '@mui/material';

const Insights: React.FC = () => (
  <Box sx={{ 
    width: '100%', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 'calc(100vh - 140px)'
  }}>
    <div style={{ 
      padding: '8px 16px', 
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0,
      backgroundColor: 'rgba(35,41,70,0.97)',
      zIndex: 1
    }}>
      <h2 style={{ margin: '0', fontSize: '1.3rem', color: '#eebbc3' }}>Code & Project Insights</h2>
    </div>
    <Box sx={{ 
      flex: 1, 
      width: '100%', 
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CodeReviewChatbot />
    </Box>
  </Box>
);

export default Insights; 