import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, BookOpen, Sparkles, Loader } from 'lucide-react';
import { generateRecommendations } from '../../backend/gemini';
import BookCard from '../components/BookCard';

const ReadHistoryPage = ({ user, readHistory, handleReadBook, handleGetSummary }) => {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    if (readHistory.length > 0) {
      setIsLoadingRecs(true);
      generateRecommendations(readHistory)
        .then(recs => setRecommendedBooks(recs))
        .catch(console.error)
        .finally(() => setIsLoadingRecs(false));
    }
  }, [readHistory]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Please Sign In</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be signed in to view and save your reading history.</p>
      </div>
    );
  }

  return (
    <div>
      <section style={{ marginBottom: '4rem' }}>
        <h2 className="section-title">
          <History size={28} color="var(--accent-cyan)" /> My Reading History
        </h2>
        {readHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>You haven't marked any books as read yet. Go to the Library to search for books!</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {readHistory.map((book, i) => (
              <div key={`hist-${i}`} style={{ background: 'var(--bg-surface)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem' }}>
                <BookOpen size={16} color="var(--accent-cyan)" /> {book.title}
              </div>
            ))}
          </div>
        )}
      </section>

      {readHistory.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <Sparkles size={28} color="var(--accent-violet)" /> AI Recommended For You
            </h2>
            {isLoadingRecs && <Loader className="spin" style={{ color: 'var(--accent-cyan)' }} />}
          </div>
          <div className="books-grid">
            {recommendedBooks.map((book, i) => (
              <BookCard key={`rec-${book.id}-${i}`} book={book} onRead={handleReadBook} onSummary={handleGetSummary} isRec />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReadHistoryPage;
