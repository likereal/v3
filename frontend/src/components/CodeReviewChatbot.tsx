import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Stack, Avatar, CircularProgress, Fade } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import './CodeReviewChatbot.css';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const CodeReviewChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! I am your AI code review assistant. Paste your code or ask a question to get started.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/code-review-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      if (res.status === 429) {
        // Handle rate limit errors
        let errorMessage = 'Rate limit exceeded. Please try again later.';
        if (data.details) {
          errorMessage += ` ${data.details}`;
        }
        if (data.retryAfter) {
          const minutes = Math.ceil(data.retryAfter / 60);
          errorMessage += ` Please wait ${minutes} minute${minutes > 1 ? 's' : ''}.`;
        }
        setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
      } else if (res.ok) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply || 'Sorry, no response.' }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${data.error || 'Unknown error occurred.'}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Could not reach code review service.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Box className="chatbot-bg" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Paper elevation={8} sx={{ width: '100%', height: '100%', p: 2, borderRadius: 0, bgcolor: 'rgba(35,41,70,0.97)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1} sx={{ flexShrink: 0 }}>
          <Avatar sx={{ bgcolor: '#b8c1ec', boxShadow: '0 0 16px #b8c1ec88', width: 32, height: 32 }}>
            <SmartToyIcon color="primary" sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="h6" color="#eebbc3" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
            Code Review Chatbot
          </Typography>
        </Stack>
        <Box className="chatbot-window" sx={{ flex: 1, overflowY: 'auto', mb: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 1.5, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, i) => (
            <Fade in key={i} timeout={400 + i * 100}>
              <Box display="flex" justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
                <Box
                  className={`chat-bubble ${msg.sender}`}
                  sx={{
                    bgcolor: msg.sender === 'user' ? '#eebbc3' : '#b8c1ec',
                    color: '#232946',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    maxWidth: '80%',
                    boxShadow: 2,
                    fontSize: 14,
                    position: 'relative',
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            </Fade>
          ))}
          {loading && (
            <Box display="flex" alignItems="center" mb={0.5}>
              <CircularProgress size={16} sx={{ color: '#b8c1ec', mr: 0.5 }} />
              <Typography variant="caption" color="#b8c1ec" sx={{ fontSize: '0.75rem' }}>AI is typing...</Typography>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Type your code or question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { fontSize: '0.9rem' } }}
            disabled={loading}
          />
          <IconButton color="primary" onClick={handleSend} sx={{ bgcolor: '#eebbc3', '&:hover': { bgcolor: '#b8c1ec' }, width: 36, height: 36 }} disabled={loading}>
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Paper>
      {/* Animated background for chatbot */}
      {/* <div className="chatbot-blob chatbot-blob1" />
      <div className="chatbot-blob chatbot-blob2" /> */}
    </Box>
  );
};

export default CodeReviewChatbot; 