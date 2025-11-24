import React, { useState, useEffect, useRef } from 'react';
import { markdownToHtml } from '../utils/helpers';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your booking assistant. I can help you book appointments, check availability, and answer questions about our services.\n\n**Try saying:**\n\n- \"Book me an appointment\"\n- \"I need to schedule a meeting\"\n- \"What are your available times?\"\n- \"My name is wissem, email wissham25@gmail.com, phone +216 56766351\"",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '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';
  const OPENROUTER_MODEL = process.env.REACT_APP_OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const autoResizeTextarea = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsTyping(true);
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
    }

    try {
      const conversationHistory = messages
        .filter(msg => msg.id !== 1)
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        }));

      conversationHistory.push({
        role: 'user',
        content: userInput,
      });

      const systemPrompt = `You are a helpful booking assistant for a service business. Your role is to:
- Help users book appointments
- Answer questions about business hours (Monday to Friday, 9:30 AM - 9:30 PM Malaysia time, closed 12:30 PM - 2:30 PM for lunch and 6:30 PM - 8:30 PM for dinner)
- Collect booking information (name, email, phone, date, time)
- Be friendly, professional, and concise
- If users want to book, guide them through the process or suggest they use the booking form

Keep responses brief and helpful. Use markdown formatting when appropriate.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Learning Booking System',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      let botMessage = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        botMessage = data.choices[0].message.content;
      } else {
        botMessage = 'Sorry, I encountered an error. Please try again.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: botMessage,
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (!OPENROUTER_API_KEY) {
        errorMessage = 'OpenRouter API key is not configured. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'API authentication failed. Please check your OpenRouter API key.';
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMessage,
          isUser: false,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    autoResizeTextarea(e.target);
  };

  return (
    <div className="chat-container active">
      <div className="chat-messages" id="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.isUser ? 'user' : 'bot'}`}>
            <div className="avatar">{message.isUser ? '👤' : '🤖'}</div>
            <div
              className="chat-bubble"
              dangerouslySetInnerHTML={{
                __html: message.isUser ? message.text : markdownToHtml(message.text),
              }}
            />
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator show">
            <div className="typing-dots">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
            Assistant is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={chatInputRef}
          id="chat-input"
          className="chat-input"
          placeholder="Type your message here..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          rows="1"
          disabled={isTyping}
        />
        <button
          type="button"
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={isTyping || !input.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;

