import React from 'react';
import CodeReviewChatbot from '../components/CodeReviewChatbot';
import { Box } from '@mui/material';

const Insights: React.FC = () => (
  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div>
      <h2>Code & Project Insights</h2>
      <ul>
        <li>Code quality: <span>Coming soon</span></li>
        <li>Test coverage: <span>Coming soon</span></li>
        <li>Build status: <span>Coming soon</span></li>
        <li>Team activity: <span>Coming soon</span></li>
      </ul>
    </div>
    <CodeReviewChatbot />
  </Box>
);

export default Insights; 