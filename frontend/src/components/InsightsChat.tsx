import React, { useState } from 'react';
import './InsightsChat.css';

const InsightsChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/insights/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages(msgs => [...msgs, { role: 'assistant', content: data.response }]);
      } else {
        setError(data.error || 'No response from server');
      }
    } catch (err: any) {
      setError('Failed to fetch response');
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div className="insights-chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Ask me anything about your projects, code, or development workflow!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant-message">
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          className="chat-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()} 
          className="chat-send-button"
        >
          Send
        </button>
      </form>
      
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default InsightsChat;
