import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

import { auth, db } from './backend/firebase';
import { getBookSummary } from './backend/gemini';

import Navigation from './ui/components/Navigation';
import ChatWidget from './ui/components/ChatWidget';
import SummaryModal from './ui/components/SummaryModal';
import LibraryPage from './ui/pages/LibraryPage';
import ReadHistoryPage from './ui/pages/ReadHistoryPage';
import ProfilePage from './ui/pages/ProfilePage';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [readHistory, setReadHistory] = useState([]);
  const [userPrefs, setUserPrefs] = useState({ persona: 'Helpful' });
  const [globalTrending, setGlobalTrending] = useState([]);

  // Summary Modal states
  const [selectedBookForSummary, setSelectedBookForSummary] = useState(null);
  const [bookSummary, setBookSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const fetchGlobalTrending = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const bookCounts = {};
        const bookDetails = {};
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.history) {
            data.history.forEach(book => {
              bookCounts[book.title] = (bookCounts[book.title] || 0) + 1;
              bookDetails[book.title] = book;
            });
          }
        });
        
        const sortedTitles = Object.keys(bookCounts).sort((a, b) => bookCounts[b] - bookCounts[a]).slice(0, 4);
        setGlobalTrending(sortedTitles.map(t => bookDetails[t]));
      } catch (e) {
        console.error("Failed to fetch global trending", e);
      }
    };
    fetchGlobalTrending();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setReadHistory(docSnap.data().history || []);
            setUserPrefs(docSnap.data().prefs || { persona: 'Helpful' });
          } else {
            setReadHistory([]);
            setUserPrefs({ persona: 'Helpful' });
          }
        } catch (e) {
          console.error("Error fetching data from Firestore:", e);
        }
      } else {
        setReadHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !isAuthLoading) {
      const saveData = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), { history: readHistory, prefs: userPrefs }, { merge: true });
        } catch (e) {
          console.error("Error saving data to Firestore:", e);
        }
      };
      if (readHistory.length > 0 || userPrefs.persona !== 'Helpful') {
         saveData();
      }
    }
  }, [readHistory, userPrefs, user, isAuthLoading]);

  const handleReadBook = (book) => {
    if (!user) {
      alert("Please sign in with Google first to save your reading history!");
      return;
    }
    setReadHistory(prev => {
      if (!prev.find(b => b.title === book.title)) {
        return [book, ...prev];
      }
      return prev;
    });
  };

  const handleGetSummary = async (book) => {
    setSelectedBookForSummary(book);
    setBookSummary(null);
    setIsSummarizing(true);
    
    try {
      const summary = await getBookSummary(book, userPrefs.persona);
      setBookSummary(summary);
    } catch (err) {
      console.error(err);
      setBookSummary({ summary: "Failed to generate summary.", takeaways: [] });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleUpdatePersona = (newPersona) => {
    setUserPrefs({ ...userPrefs, persona: newPersona });
  };

  return (
    <Router>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <div className="app-container">
        <Navigation user={user} isAuthLoading={isAuthLoading} />

        <main style={{ marginTop: '2rem' }}>
          <Routes>
            <Route path="/" element={<LibraryPage handleReadBook={handleReadBook} handleGetSummary={handleGetSummary} persona={userPrefs.persona} globalTrending={globalTrending} />} />
            <Route path="/history" element={<ReadHistoryPage user={user} readHistory={readHistory} handleReadBook={handleReadBook} handleGetSummary={handleGetSummary} persona={userPrefs.persona} />} />
            <Route path="/profile" element={<ProfilePage user={user} userPrefs={userPrefs} handleUpdatePersona={handleUpdatePersona} readHistory={readHistory} />} />
          </Routes>
        </main>

        <ChatWidget readHistory={readHistory} persona={userPrefs.persona} />

        <SummaryModal 
          book={selectedBookForSummary} 
          summary={bookSummary} 
          isSummarizing={isSummarizing} 
          onClose={() => setSelectedBookForSummary(null)} 
        />
      </div>
    </Router>
  );
}

export default App;
