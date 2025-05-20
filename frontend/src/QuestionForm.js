import React, { useState } from 'react';

function QuestionForm({ onQuestionCreated, channelId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        const formData = new FormData();
        formData.append('channel_id', channelId); 
        formData.append('title', title);
        formData.append('content', content);
        //formData.append('user_id', localStorage.getItem('user_id'));  // INSECURE - REMOVE THIS LINE
        if (image) {
            formData.append('image', image);
        }

        const token = localStorage.getItem('token'); // Get the token
        console.log('FormData being sent:', formData);  // Add this line

        const response = await fetch('http://localhost:5000/addquestion', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Question created:', data);
        setTitle('');
        setContent('');
        setImage(null);
        onQuestionCreated();
    } catch (error) {
        console.error('Error creating question:', error);
    }
};

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        Ask a Question
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="title" style={{ fontWeight: 'bold', display: 'block' }}>
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="content" style={{ fontWeight: 'bold', display: 'block' }}>
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px', minHeight: '100px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="image" style={{ fontWeight: 'bold', display: 'block' }}>
            Image (optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
          Post Question
        </button>
      </form>
    </div>
  );
}

export default QuestionForm;