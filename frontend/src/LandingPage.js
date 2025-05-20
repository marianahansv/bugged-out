// LandingPage.js
import React from 'react';

function LandingPage({ onLoginClick, onRegisterClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>Welcome to BuggedOut!</h1>
      <p>A forum for all your bug-related questions.</p>
      <div>
        <button style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }} onClick={onLoginClick}>Login</button>
        <button style={{ margin: '10px', padding: '10px 20px', fontSize: '16px' }} onClick={onRegisterClick}>Register</button>
      </div>
    </div>
  );
}

export default LandingPage;