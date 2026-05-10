import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Sparkles, Send, Loader, Mic, Volume2 } from 'lucide-react';
import { chatWithLibrarian } from '../../backend/gemini';

const ChatWidget = ({ readHistory, persona }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: 'Hello! I am your AI Librarian. Ask me anything about books or for specific recommendations.' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || chatInput;
    if (!text.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatting(true);

    try {
      const reply = await chatWithLibrarian(newMessages, readHistory, persona);
      setChatMessages([...newMessages, { role: 'model', text: reply }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(null, transcript);
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakMessage = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    
    if (persona === 'Enthusiastic Geek') utterance.rate = 1.2;
    if (persona === 'Academic Scholar') utterance.pitch = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chat-widget">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="chat-window"
          >
            <div className="chat-header">
              <Sparkles size={18} color="var(--accent-violet)" /> AI Librarian ({persona})
              <button onClick={() => setIsChatOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`} style={{ position: 'relative' }}>
                  {msg.text}
                  {msg.role === 'model' && (
                    <button onClick={() => speakMessage(msg.text)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', position: 'absolute', right: '-24px', top: '50%', transform: 'translateY(-50%)' }}>
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {isChatting && <div className="chat-bubble ai"><Loader size={16} className="spin" /></div>}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={(e) => handleSendMessage(e)} className="chat-input-area">
              <button type="button" onClick={toggleListening} style={{ background: 'none', border: 'none', color: isListening ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', padding: '0 0.5rem' }}>
                <Mic size={20} className={isListening ? 'spin' : ''} style={{ animationDuration: '2s' }} />
              </button>
              <input type="text" className="chat-input" placeholder="Ask about a book..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
              <button type="submit" className="chat-send" disabled={isChatting || !chatInput.trim()}><Send size={16} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="chat-toggle" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default ChatWidget;
