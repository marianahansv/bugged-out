// provides the sign-in modal.
// this file collects credentials, calls the login endpoint, and returns the token
// plus user details to the app shell.

// LoginForm.js
import React, { useState } from 'react';
import { apiUrl } from './api';

function LoginForm({ onLoginSuccess, onCancel }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      try {
        const response = await fetch(apiUrl('/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          onLoginSuccess(data.token, data.user.username, data.user.display_name); // Send token
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Network error');
      }
    };
  return (
    <div className="form-card auth-modal">
      <div className="form-header">
        <h2 className="form-title">Sign In</h2>
        <button className="ghost-button" type="button" onClick={onCancel}>Close</button>
      </div>
      <p className="form-copy">
        Signing in is optional. It lets you vote and post under your saved identity.
      </p>
      {error && <p className="error-text">{error}</p>}
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="primary-button" type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default LoginForm;
