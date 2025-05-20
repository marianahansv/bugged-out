import React from 'react';

function ChannelList({ channels, onChannelClick, selectedChannelId  }) {
  return (
    <div>
        {channels.map((channel) => {
            const isSelected = channel.id === selectedChannelId ; // Check if selected
            return (
                <div
                    key={channel.id}
                    style={{
                        borderBottom: '1px solid #ccc',
                        padding: '10px 0',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#e0e0e0' : 'transparent', // Highlight
                        fontWeight: isSelected ? 'bold' : 'normal',        // Optional: Bold text
                        color: isSelected ? '#000' : '#555'           // Optional: Change text color
                      }
                  }
                    onClick={() => onChannelClick(channel.id)}
                >
                    {channel.channel_name}
                </div>
            );
        })}
    </div>
);
}

export default ChannelList;