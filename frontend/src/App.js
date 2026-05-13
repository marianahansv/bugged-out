// App.js
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleChannelClick = (channelId) => {
    setSelectedChannelId(channelId);
  };

  const handleLoginSuccess = (token, username, displayName) => { // Receive token
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    localStorage.setItem('token', token); // Store token
    localStorage.setItem('username', username);
    localStorage.setItem('display_name', displayName);
    setUsername(username);
    setDisplayName(displayName);
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
    setIsAuthenticated(false);
    setUsername('');
    setDisplayName('');
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
              Ask questions, share fixes, and explore the forum without creating an account.
            </p>
          </div>
          {isAuthenticated ? (
            <div className="app-auth-cluster">
              <span>Welcome, {displayName || username}</span>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="app-auth-cluster">
              <span className="muted-note">Optional: sign in to vote and keep your identity.</span>
              <button className="ghost-button" onClick={() => { setShowRegister(false); setShowLogin(true); }}>Sign In</button>
              <button className="primary-button" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Create Account</button>
            </div>
          )}
        </header>

        {!isAuthenticated && (
          <div className="guest-banner">
            Guest mode is enabled. You can browse, ask questions, and reply right away. Voting is reserved for signed-in users.
          </div>
        )}

        {showLogin && <LoginForm onLoginSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />}
        {showRegister && <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} onCancel={() => setShowRegister(false)} />}

        <div className="app-layout">
          <ChannelView onChannelClick={handleChannelClick} />
          <MainView selectedChannelId={selectedChannelId} />
        </div>

        <footer className="footer">
          <p>© 2025 BuggedOut. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
