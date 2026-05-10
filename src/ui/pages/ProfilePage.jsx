import React from 'react';
import { User, LogOut, Settings, Award, Flame, Book, Sparkles } from 'lucide-react';
import { logout } from '../../backend/firebase';

const personas = ['Helpful', 'Academic Scholar', 'Sarcastic & Witty', 'Enthusiastic Geek'];

const ProfilePage = ({ user, userPrefs, handleUpdatePersona, readHistory }) => {
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Please Sign In</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be signed in to view your profile and customize your AI.</p>
      </div>
    );
  }

  // Basic gamification stats
  const booksRead = readHistory?.length || 0;
  let level = "Novice Reader";
  if (booksRead > 5) level = "Bookworm";
  if (booksRead > 15) level = "Scholar";
  if (booksRead > 30) level = "Grandmaster Librarian";

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profile Header */}
      <div style={{ background: 'var(--bg-surface)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-glass)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user.photoURL ? (
          <img src={user.photoURL} alt="Avatar" style={{ width: 120, height: 120, borderRadius: 60, border: '4px solid rgba(255,255,255,0.1)' }} />
        ) : (
          <div style={{ width: 120, height: 120, borderRadius: 60, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={64} color="var(--text-secondary)" />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{user.displayName}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>{user.email}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(167, 139, 250, 0.15)', color: 'var(--accent-violet)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
            <Award size={18} /> {level}
          </div>
        </div>
        <button onClick={logout} className="action-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Stats & Gamification */}
        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={24} color="#f97316" /> Reading Stats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}><Book size={18} /> Books Read</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{booksRead}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}><Sparkles size={18} /> AI Queries</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{booksRead * 2 + 5}</div>
            </div>
          </div>
        </div>

        {/* AI Persona Selection */}
        <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={24} color="var(--accent-cyan)" /> Librarian Persona
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Customize the personality and tone of your AI Librarian's chat and recommendations.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {personas.map(p => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: userPrefs?.persona === p ? 'rgba(34, 211, 238, 0.1)' : 'rgba(0,0,0,0.2)', border: `1px solid ${userPrefs?.persona === p ? 'var(--accent-cyan)' : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input type="radio" name="persona" value={p} checked={userPrefs?.persona === p} onChange={() => handleUpdatePersona(p)} style={{ accentColor: 'var(--accent-cyan)', width: '18px', height: '18px' }} />
                <span style={{ fontWeight: userPrefs?.persona === p ? 'bold' : 'normal', color: userPrefs?.persona === p ? 'white' : 'var(--text-secondary)' }}>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
