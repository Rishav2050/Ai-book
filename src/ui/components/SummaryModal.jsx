import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Info, Loader, Volume2, VolumeX } from 'lucide-react';

const SummaryModal = ({ book, summary, isSummarizing, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (summary) {
      const textToSpeak = `${book.title} by ${book.author}. Summary: ${summary.summary}. Key Takeaways: ${summary.takeaways.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleClose = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    onClose();
  };

  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="modal-content">
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.25rem' }}>{book.title}</h2>
              <div style={{ color: 'var(--accent-cyan)' }}>by {book.author}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {summary && (
                <button className="close-btn" onClick={toggleSpeech} title="Read Aloud" style={{ color: isSpeaking ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                  {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              )}
              <button className="close-btn" onClick={handleClose}><X size={24} /></button>
            </div>
          </div>
          <div className="modal-body">
            {isSummarizing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                <Loader size={32} className="spin" style={{ color: 'var(--accent-violet)', marginBottom: '1rem' }} />
                <p>Reading the book and generating insights...</p>
              </div>
            ) : summary ? (
              <>
                <div>
                  <h4><Info size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }}/> Summary</h4>
                  <p>{summary.summary}</p>
                </div>
                <div>
                  <h4><Sparkles size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }}/> Key Takeaways</h4>
                  <ul>
                    {summary.takeaways?.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SummaryModal;
