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
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply || 'Sorry, no response.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error: Could not reach code review service.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Box className="chatbot-bg" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, position: 'relative' }}>
      <Paper elevation={8} sx={{ maxWidth: 480, width: '100%', p: 2, borderRadius: 4, bgcolor: 'rgba(35,41,70,0.97)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)', position: 'relative', zIndex: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Avatar sx={{ bgcolor: '#b8c1ec', boxShadow: '0 0 16px #b8c1ec88' }}>
            <SmartToyIcon color="primary" />
          </Avatar>
          <Typography variant="h6" color="#eebbc3" fontWeight={700}>
            Code Review Chatbot
          </Typography>
        </Stack>
        <Box className="chatbot-window" sx={{ maxHeight: 260, minHeight: 180, overflowY: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 1, position: 'relative' }}>
          {messages.map((msg, i) => (
            <Fade in key={i} timeout={400 + i * 100}>
              <Box display="flex" justifyContent={msg.sender === 'user' ? 'flex-end' : 'flex-start'} mb={1}>
                <Box
                  className={`chat-bubble ${msg.sender}`}
                  sx={{
                    bgcolor: msg.sender === 'user' ? '#eebbc3' : '#b8c1ec',
                    color: '#232946',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                    boxShadow: 2,
                    fontSize: 15,
                    position: 'relative',
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            </Fade>
          ))}
          {loading && (
            <Box display="flex" alignItems="center" mb={1}>
              <CircularProgress size={18} sx={{ color: '#b8c1ec', mr: 1 }} />
              <Typography variant="caption" color="#b8c1ec">AI is typing...</Typography>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Type your code or question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ bgcolor: 'white', borderRadius: 2 }}
            disabled={loading}
          />
          <IconButton color="primary" onClick={handleSend} sx={{ bgcolor: '#eebbc3', '&:hover': { bgcolor: '#b8c1ec' } }} disabled={loading}>
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
      {/* Animated background for chatbot */}
      <div className="chatbot-blob chatbot-blob1" />
      <div className="chatbot-blob chatbot-blob2" />
    </Box>
  );
};

export default CodeReviewChatbot; 