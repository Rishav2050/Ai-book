import React, { useState } from 'react';
import { Search, Loader, AlertCircle, BookOpen, Sparkles, Map, Mic, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchBooks, generateRoadmap } from '../../backend/gemini';
import BookCard from '../components/BookCard';

const LibraryPage = ({ handleReadBook, handleGetSummary, persona, globalTrending }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [error, setError] = useState('');

  // Roadmap State
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoadingSearch(true);
    setError('');
    setRoadmap(null);

    try {
      const results = await searchBooks(searchQuery, persona);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setError("Failed to perform search. Please check your API key.");
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!searchQuery.trim()) return;
    setIsGeneratingRoadmap(true);
    setSearchResults([]);
    setError('');

    try {
      const rm = await generateRoadmap(searchQuery, persona);
      setRoadmap(rm);
    } catch (err) {
      console.error(err);
      setError("Failed to generate roadmap.");
    } finally {
      setIsGeneratingRoadmap(false);
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
      setSearchQuery(transcript);
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const isSearching = searchResults.length > 0 || isLoadingSearch || isGeneratingRoadmap || roadmap;

  return (
    <div>
      <header className="header" style={{ paddingTop: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="logo-text">Neural Library</h1>
          <p className="subtitle">Your intelligent gateway to universal knowledge. Powered by Google Gemini & Firebase.</p>
        </motion.div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="search-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
            <Search className="search-icon" size={22} />
            <input 
              type="text" 
              className="search-input" 
              style={{ paddingRight: '120px' }}
              placeholder="E.g., 'Quantum Physics' or 'Epic Fantasy'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" onClick={toggleListening} style={{ position: 'absolute', right: '5.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: isListening ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}>
              <Mic size={20} className={isListening ? 'spin' : ''} style={{ animationDuration: '2s' }} />
            </button>
            <button type="submit" className="btn-primary" disabled={isLoadingSearch || isGeneratingRoadmap}>
              {isLoadingSearch ? <Loader className="spin" size={20} /> : 'Search'}
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" onClick={handleGenerateRoadmap} disabled={isLoadingSearch || isGeneratingRoadmap || !searchQuery.trim()} className="action-btn" style={{ background: 'rgba(167, 139, 250, 0.15)', color: 'var(--accent-violet)', border: '1px solid rgba(167, 139, 250, 0.3)', padding: '0.5rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              {isGeneratingRoadmap ? <Loader size={16} className="spin" /> : <Map size={16} />} Create AI Roadmap
            </button>
          </div>
        </form>

        {(searchResults.length > 0 || roadmap) && (
           <button onClick={() => {setSearchResults([]); setRoadmap(null); setSearchQuery('');}} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline' }}>Clear Results</button>
        )}
      </header>

      <section>
        {isSearching && !roadmap && (
          <h2 className="section-title">
            <Search size={28} color="var(--accent-cyan)" /> AI Search Results
          </h2>
        )}
        
        {/* Roadmap Display */}
        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '4rem' }}>
             <h2 className="section-title"><Map size={28} color="var(--accent-violet)" /> Your Learning Roadmap</h2>
             <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
                <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#e2e8f0' }}>"{roadmap.intro}"</p>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(167, 139, 250, 0.3)' }}></div>
                {roadmap.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '2rem', paddingLeft: '3rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '0', top: '20px', width: '34px', height: '34px', borderRadius: '17px', background: 'var(--bg-base)', border: '2px solid var(--accent-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-violet)' }}>{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: 'var(--accent-violet)', color: 'white', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{step.level}</div>
                      <BookCard book={step} onRead={handleReadBook} onSummary={handleGetSummary} isRec={true} />
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {/* Normal Search Results */}
        {searchResults.length > 0 && (
          <motion.div layout className="books-grid">
            <AnimatePresence>
              {searchResults.map((book, i) => (
                <BookCard key={`search-${book.id}-${i}`} book={book} onRead={handleReadBook} onSummary={handleGetSummary} isSearch />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Global Trending */}
        {!isSearching && globalTrending.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem' }}>
             <h2 className="section-title" style={{ justifyContent: 'center' }}>
                <Globe size={28} color="var(--accent-cyan)" /> Global Trending
             </h2>
             <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>What other users are reading right now.</p>
             <div className="books-grid">
                {globalTrending.map((book, i) => (
                  <BookCard key={`global-${book.title}-${i}`} book={book} onRead={handleReadBook} onSummary={handleGetSummary} />
                ))}
             </div>
          </motion.div>
        )}

        {/* Default Empty State */}
        {!isSearching && globalTrending.length === 0 && (
           <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-glass)', borderRadius: '24px', background: 'var(--bg-surface)' }}>
              <BookOpen size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to your next generation library</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Describe exactly what you want to read, or ask to generate a Roadmap.</p>
           </div>
        )}
      </section>
    </div>
  );
};

export default LibraryPage;
