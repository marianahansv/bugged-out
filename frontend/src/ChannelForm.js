import React, { useState } from 'react';

function ChannelForm({ onSubmit }) {
  const [newChannelName, setNewChannelName] = useState('');

  const handleSubmit = (event) => {
    //event.preventDefault();
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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="New Channel Name"
        value={newChannelName}
        onChange={(e) => setNewChannelName(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        style={{ width: '100%', padding: '5px', fontSize: '14px', marginTop: '5px', marginRight: '5px' }}
        required
      />
    </form>
  );
}

export default ChannelForm;