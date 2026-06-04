// coordinates the main buggedout application shell.
// this file manages authentication state, channel selection, layout, and auth modals.

import React, { useState, useEffect } from 'react';
import MainView from './MainView';
import ChannelView from './ChannelView';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

function App() {
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [displayName, setDisplayName] = useState(localStorage.getItem('display_name') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('is_admin') === 'true');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleChannelClick = (channelId) => {
    setSelectedChannelId(channelId);
  };

  const handleLoginSuccess = (token, username, displayName, isAdminUser) => { // Receive token
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    localStorage.setItem('token', token); // Store token
    localStorage.setItem('username', username);
    localStorage.setItem('display_name', displayName);
    localStorage.setItem('is_admin', String(Boolean(isAdminUser)));
    setUsername(username);
    setDisplayName(displayName);
    setIsAdmin(Boolean(isAdminUser));
  };

  const handleRegistrationSuccess = (registeredUsername) => {
    setShowRegister(false);
    setShowLogin(true);
    setUsername(registeredUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('display_name');
    localStorage.removeItem('is_admin');
    setIsAuthenticated(false);
    setUsername('');
    setDisplayName('');
    setIsAdmin(false);
  };

  const isAuthOverlayOpen = showLogin || showRegister;

  return (
    <div className="app-shell">
      {isAuthOverlayOpen && <div className="auth-backdrop" aria-hidden="true" />}
      <div className={`page-frame ${isAuthOverlayOpen ? 'is-obscured' : ''}`}>
        <header className="app-header">
          <div className="app-brand">
            <h1>BuggedOut 🐞</h1>
            <p className="app-subtitle">
              Ask dev questions and share fixes.
            </p>
          </div>
          {isAuthenticated ? (
            <div className="app-auth-cluster">
              <span>Welcome, {displayName || username}</span>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="app-auth-cluster">
              <button className="ghost-button" onClick={() => { setShowRegister(false); setShowLogin(true); }}>Sign In</button>
              <button className="primary-button" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Create Account</button>
            </div>
          )}
        </header>

        {!isAuthenticated && (
          <div className="guest-banner">
            You can browse, ask, and reply as a guest. Sign in to vote.
          </div>
        )}

        {showLogin && <LoginForm onLoginSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />}
        {showRegister && <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} onCancel={() => setShowRegister(false)} />}

        <div className="app-layout">
          <ChannelView onChannelClick={handleChannelClick} />
          <MainView selectedChannelId={selectedChannelId} isAdmin={isAdmin} />
        </div>

        <footer className="footer">
          <p>© 2025 BuggedOut. Mariana Hans :&#41;</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
