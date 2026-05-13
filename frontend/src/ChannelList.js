import React from 'react';

function ChannelList({ channels, onChannelClick, selectedChannelId  }) {
  return (
    <div className="channel-list">
        {channels.map((channel) => {
            const isSelected = channel.id === selectedChannelId;
            return (
                <div
                    key={channel.id}
                    className={`channel-item ${isSelected ? 'is-selected' : ''}`}
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
