// provides the form for creating replies.
// this file handles top-level answers and nested replies by passing content
// and an optional parent reply id back to the question page.

import React, { useState } from 'react';

function ReplyForm({ onSubmit, parentReplyId }) { // Added parentReplyId prop
  const [content, setContent] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(content, parentReplyId); // Send parentReplyId to onSubmit
    setContent('');
  };

  return (
    <form className="form-stack reply-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        className="reply-textarea"
        required
      />
      <button className="primary-button" type="submit">
        Post Reply
      </button>
    </form>
  );
}

export default ReplyForm;
