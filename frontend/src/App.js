// App.js
import React, { useState, useEffect } from 'react';
import MainView from './MainView';
import ChannelView from './ChannelView';
import LandingPage from './LandingPage';
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
    const token = localStorage.getItem('token'); // Check for token
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleChannelClick = (channelId) => {
    console.log('App.js: handleChannelClick called with channelId = ', channelId);
    setSelectedChannelId(channelId); // ONLY this line
    console.log('App.js: selectedChannelId is now ', selectedChannelId);
};

  const handleLoginSuccess = (token, username, displayName) => { // Receive token
    setIsAuthenticated(true);
    setShowLogin(false);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
      <header style={{ backgroundColor: '#f0f2f5', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>BuggedOut 🐞</h1>
        {isAuthenticated ? (
          <div>
            <span>Welcome, {displayName}</span>
            <button style={{ marginLeft: '10px' }} onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <button style={{ marginLeft: '10px' }} onClick={() => setShowLogin(true)}>Login</button>
            <button style={{ marginLeft: '10px' }} onClick={() => setShowRegister(true)}>Register</button>
          </div>
        )}
      </header>

      {showLogin && <LoginForm onLoginSuccess={handleLoginSuccess} />}
      {showRegister && <RegistrationForm onRegistrationSuccess={handleRegistrationSuccess} />}

      {!isAuthenticated && !showLogin && !showRegister ? (
        <LandingPage onLoginClick={() => setShowLogin(true)} onRegisterClick={() => setShowRegister(true)} />
      ) : isAuthenticated ? (
        <div style={{ display: 'flex', flex: 1 }}>
          <ChannelView onChannelClick={handleChannelClick} />
          <MainView selectedChannelId={selectedChannelId} />
        </div>
      ) : null}

      <footer style={{ backgroundColor: '#e9ecef', padding: '10px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px' }}>© 2025 BuggedOut. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;