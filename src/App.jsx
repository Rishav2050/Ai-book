import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Sparkles, History, Loader, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackGradients = [
  'linear-gradient(135deg, #FF6B6B, #556270)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #84fab0, #8fd3f4)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)'
];

function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [searchQuery, setSearchQuery] = useState('');
  
  const [readHistory, setReadHistory] = useState([]); // Array of full book objects
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [error, setError] = useState('');

  // Helper to fetch real book details from Google Books API
  const fetchBookDetailsFromInternet = async (title, author) => {
    try {
      // Basic search string
      const query = encodeURIComponent(`${title} ${author}`);
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const vol = data.items[0].volumeInfo;
        return {
          id: data.items[0].id || Math.random().toString(),
          title: vol.title || title,
          author: vol.authors ? vol.authors.join(', ') : author,
          description: vol.description || 'No description available from Google Books.',
          coverUrl: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
          category: vol.categories ? vol.categories[0] : 'Literature',
          coverColor: fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)]
        };
      }
    } catch(e) {
      console.error('Error fetching book from Google Books:', e);
    }
    
    // Fallback if not found on internet
    return {
      id: Math.random().toString(),
      title,
      author,
      description: 'A highly recommended book matching your interests.',
      coverUrl: null,
      category: 'Book',
      coverColor: fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)]
    };
  };

  const handleReadBook = (book) => {
    setReadHistory(prev => {
      if (!prev.find(b => b.id === book.id)) {
        return [book, ...prev];
      }
      return prev;
    });
  };

  // Generate Recommendations using Gemini API + Google Books
  const generateRecommendations = async () => {
    if (!apiKey) {
      setError('Environment variable VITE_GEMINI_API_KEY is missing.');
      return;
    }
    if (readHistory.length === 0) return;

    setIsLoadingRecs(true);
    setError('');

    const historyTitles = readHistory.map(b => `"${b.title}" by ${b.author}`).join(', ');
    const prompt = `
      You are an expert librarian AI.
      The user has read the following books: ${historyTitles}.
      
      Based on their reading history, recommend 4 REAL, existing books that they haven't read yet.
      Return the response STRICTLY as a JSON array of objects, where each object has:
      - "title": the exact title of the book
      - "author": the author of the book
      - "reason": a short 1-sentence explanation of why it fits their interest based on their history.
      
      DO NOT return markdown. Return ONLY the raw JSON array.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from Gemini API.');
      
      const data = await response.json();
      let textResponse = data.candidates[0].content.parts[0].text;
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedRecs = JSON.parse(textResponse);
      
      // Fetch internet metadata for each AI recommendation
      const enrichedRecs = await Promise.all(
        parsedRecs.map(async (rec) => {
          const bookData = await fetchBookDetailsFromInternet(rec.title, rec.author);
          return { ...bookData, aiReason: rec.reason };
        })
      );

      setRecommendedBooks(enrichedRecs);
    } catch (err) {
      console.error(err);
      setError('Error generating recommendations.');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Automatically fetch recommendations when history changes
  useEffect(() => {
    if (readHistory.length > 0 && apiKey) {
      generateRecommendations();
    }
  }, [readHistory]);

  // Semantic Search using Gemini API + Google Books
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!apiKey) {
      setError('Environment variable VITE_GEMINI_API_KEY is missing.');
      return;
    }

    setIsLoadingSearch(true);
    setError('');

    const prompt = `
      You are an expert librarian AI.
      The user is searching for books related to this semantic query/theme: "${searchQuery}"
      
      Find the 6 best matching REAL, existing books for this query.
      Return the response STRICTLY as a JSON array of objects, where each object has:
      - "title": the exact title of the book
      - "author": the author of the book
      - "matchScore": a percentage string indicating how well it matches (e.g., "95%")
      - "reason": a short 1-sentence explanation of how it matches their query.
      
      DO NOT return markdown. Return ONLY the raw JSON array.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from Gemini API.');
      
      const data = await response.json();
      let textResponse = data.candidates[0].content.parts[0].text;
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedResults = JSON.parse(textResponse);
      
      // Fetch internet metadata for each AI search result
      const enrichedResults = await Promise.all(
        parsedResults.map(async (res) => {
          const bookData = await fetchBookDetailsFromInternet(res.title, res.author);
          return { ...bookData, aiReason: res.reason, matchScore: res.matchScore };
        })
      );

      setSearchResults(enrichedResults);
    } catch (err) {
      console.error(err);
      setError('Error performing AI search.');
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const isSearching = searchResults.length > 0 || isLoadingSearch;

  return (
    <>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <div className="app-container">
        <header className="header" style={{ paddingTop: '4rem' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="logo-text">Neural Library <span style={{fontSize: '1.5rem', verticalAlign: 'middle', color: '#a855f7'}}>LIVE</span></h1>
            <p className="subtitle">Powered by Gemini AI and Google Books. Search any concept, and the AI will scan the internet to find the perfect books for you.</p>
          </motion.div>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="e.g. 'Books about the psychology of decision making'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="action-btn btn-primary" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', margin: 0, padding: '0.5rem 1rem' }} disabled={isLoadingSearch}>
              {isLoadingSearch ? <Loader className="spin" size={18} /> : 'Search AI'}
            </button>
          </form>
          {searchResults.length > 0 && (
             <button onClick={() => {setSearchResults([]); setSearchQuery('');}} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Clear Search Results</button>
          )}
        </header>

        <main>
          {/* Recommendation Section */}
          <AnimatePresence>
            {!isSearching && readHistory.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: '3rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>
                    <Sparkles className="section-icon" /> AI Recommended For You
                  </h2>
                  {isLoadingRecs && <Loader className="spin" style={{ color: 'var(--accent-color)' }} />}
                </div>
                
                <div className="books-grid">
                  {recommendedBooks.map(book => (
                    <BookCard key={`rec-${book.id}`} book={book} onRead={() => handleReadBook(book)} isRec={true} />
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Main Search Results */}
          <section>
            {isSearching && (
              <h2 className="section-title">
                <Search className="section-icon" /> AI Search Results
              </h2>
            )}
            
            {searchResults.length > 0 ? (
              <motion.div layout className="books-grid">
                <AnimatePresence>
                  {searchResults.map(book => (
                    <BookCard key={`search-${book.id}`} book={book} onRead={() => handleReadBook(book)} isSearch={true} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : !isSearching && readHistory.length === 0 ? (
               <div className="empty-state">
                  <Search className="empty-icon" size={48} />
                  <h3>Welcome to Neural Library</h3>
                  <p>Type a topic, concept, or feeling above. The AI will search the internet for the best books in the world that match your query.</p>
               </div>
            ) : null}
          </section>

          {/* Reading History */}
          {readHistory.length > 0 && !isSearching && (
            <section style={{ marginTop: '3rem' }}>
              <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
                <History className="section-icon" size={20} /> Recently Read
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {readHistory.map(book => (
                  <div key={book.id} style={{ background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {book.title}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}

const BookCard = ({ book, onRead, isRec, isSearch }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="book-card"
    >
      <div className="book-cover" style={{ background: book.coverUrl ? '#000' : book.coverColor, padding: book.coverUrl ? 0 : undefined }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        ) : (
          <div className="book-cover-overlay"></div>
        )}
        
        {isSearch && book.matchScore && (
          <div className="similarity-badge" style={{ zIndex: 10 }}>{book.matchScore} Match</div>
        )}
        <div className="book-category" style={{ zIndex: 10 }}>{book.category}</div>
        
        {!book.coverUrl && (
          <h3 style={{ position: 'relative', zIndex: 2, color: 'white', textAlign: 'center', padding: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontFamily: 'Outfit, sans-serif' }}>
            {book.title}
          </h3>
        )}
      </div>
      <div className="book-content">
        <h4 className="book-title">{book.title}</h4>
        <div className="book-author">{book.author}</div>
        <p className="book-desc" style={{ WebkitLineClamp: (isRec || isSearch) ? 2 : 3 }}>{book.description}</p>
        
        {(isRec || isSearch) && book.aiReason && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.85rem', color: '#c7d2fe', fontStyle: 'italic', marginBottom: '1rem' }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            {book.aiReason}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <button className="action-btn btn-primary" onClick={onRead} style={{ width: '100%', justifyContent: 'center' }}>
            <BookOpen size={16} /> Mark as Read
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default App;
