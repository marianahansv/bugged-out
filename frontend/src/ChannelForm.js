import React, { useState } from 'react';

function ChannelForm({ onSubmit }) {
  const [newChannelName, setNewChannelName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(newChannelName);
    setNewChannelName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSubmit()
    }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New Channel Name"
        value={newChannelName}
        onChange={(e) => setNewChannelName(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        required
      />
    </form>
  );
}

export default ChannelForm;
