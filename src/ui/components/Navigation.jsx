import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogIn, LogOut, User, Library, History } from 'lucide-react';
import { signInWithGoogle, logout } from '../../backend/firebase';

const Navigation = ({ user, isAuthLoading }) => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch(e) {
      alert("Failed to sign in. " + e.message);
    }
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', gap: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <NavLink to="/" style={({isActive}) => ({ color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 })}>
          <Library size={18} /> Global Library
        </NavLink>
        {user && (
          <NavLink to="/history" style={({isActive}) => ({ color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 })}>
            <History size={18} /> My Reading History
          </NavLink>
        )}
      </div>

      {!isAuthLoading && (
        user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: 32, height: 32, borderRadius: 16 }} />
              ) : (
                <User size={20} />
              )}
              <span>{user.displayName}</span>
            </NavLink>
            <button onClick={logout} className="action-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
              <LogOut size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Sign Out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="action-btn" style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            <LogIn size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Sign in with Google
          </button>
        )
      )}
    </nav>
  );
};

export default Navigation;
