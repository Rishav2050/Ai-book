import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Info, BookA } from 'lucide-react';

const BookCard = ({ book, onRead, onSummary, isRec, isSearch }) => {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="book-card">
      <div className="book-cover">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: book.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <h3 style={{ color: 'white', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{book.title}</h3>
          </div>
        )}
        {isSearch && book.matchScore && <div className="similarity-badge" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--accent-violet)', padding: '0.2rem 0.6rem', borderRadius: '8px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>{book.matchScore} Match</div>}
        <div className="book-category">{book.category}</div>
      </div>
      <div className="book-content">
        <h4 className="book-title">{book.title}</h4>
        <div className="book-author">{book.author}</div>
        <p className="book-desc">{book.description}</p>
        
        {(isRec || isSearch) && book.aiReason && (
          <div className="ai-reason">
            <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {book.aiReason}
          </div>
        )}

        <div className="card-actions">
          <button className="btn-secondary" onClick={() => onSummary(book)}>
            <Info size={16} /> Summary
          </button>
          <button className="btn-secondary" onClick={() => onRead(book)} style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(34, 211, 238, 0.2)' }}>
            <BookA size={16} /> Mark as Read
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
