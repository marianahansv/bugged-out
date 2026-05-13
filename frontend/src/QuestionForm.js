import React, { useState } from 'react';
import { apiUrl } from './api';

function QuestionForm({ onQuestionCreated, channelId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
        const formData = new FormData();
        formData.append('channel_id', channelId); 
        formData.append('title', title);
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl('/addquestion'), {
            method: 'POST',
            body: formData,
            headers,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        await response.json();
        setTitle('');
        setContent('');
        setImage(null);
        onQuestionCreated();
    } catch (error) {
        console.error('Error creating question:', error);
        setError(error.message);
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Ask a Question</h2>
      <p className="form-copy">Use the selected channel to keep the discussion organized and easy to review.</p>
      <form className="form-stack" onSubmit={handleSubmit}>
        {error && <p className="error-text">{error}</p>}
        <div className="form-field">
          <label htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={!channelId}
          />
        </div>
        <div className="form-field">
          <label htmlFor="content">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ minHeight: '120px' }}
            required
            disabled={!channelId}
          />
        </div>
        <div className="form-field">
          <label htmlFor="image">
            Image (optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button className="primary-button" type="submit" disabled={!channelId}>
          Post Question
        </button>
      </form>
    </div>
  );
}

export default QuestionForm;
