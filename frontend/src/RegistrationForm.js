// provides the account creation modal.
// this file collects username, password, and display name, then calls the register api.

// RegistrationForm.js
import React, { useState } from 'react';
import { apiUrl } from './api';

function RegistrationForm({ onRegistrationSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [display_name, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(apiUrl('/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, display_name }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegistrationSuccess(username); // Notify App.js
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error');
    }
  };

  return (
    <div className="form-card auth-modal">
      <div className="form-header">
        <h2 className="form-title">Create Account</h2>
        <button className="ghost-button" type="button" onClick={onCancel}>Close</button>
      </div>
      <p className="form-copy">
        Create an account if you want a persistent identity for your posts and access to voting.
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
        <div className="form-field">
          <label>Display Name</label>
          <input type="text" value={display_name} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <button className="primary-button" type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
