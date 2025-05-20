import React, { useState } from 'react';

function ReplyForm({ onSubmit, parentReplyId }) { // Added parentReplyId prop
  const [content, setContent] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(content, parentReplyId); // Send parentReplyId to onSubmit
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        style={{ width: '100%', padding: '8px', fontSize: '16px', minHeight: '80px', marginBottom: '10px' }}
        required
      />
      <button type="submit" style={{ padding: '8px 16px', fontSize: '14px' }}>
        Post Reply
      </button>
    </form>
  );
}

export default ReplyForm;