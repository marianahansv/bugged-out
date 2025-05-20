import React, { useState, useEffect, useCallback } from 'react';
import ChannelList from './ChannelList';
import ChannelForm from './ChannelForm';

function ChannelView({ onChannelClick }) {
    const [showAddChannelForm, setShowAddChannelForm] = useState(false);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannelId, setSelectedChannelId] = useState(null); // Add local state

    const fetchChannels = useCallback(() => {
        setLoading(true);
        fetch('http://localhost:5000/getallchannels')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setChannels(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching channels:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleAddChannel = (channelName) => {
        if (channelName.trim() === '') return;

        fetch('http://localhost:5000/addchannel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_name: channelName }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const newChannel = { id: data.channelId, channel_name: channelName };
                setChannels((prevChannels) => [...prevChannels, newChannel]);
                setShowAddChannelForm(false);
            })
            .catch((error) => console.error('Error adding channel:', error));
    };

    const handleChannelClick = (channelId) => {
        setSelectedChannelId(channelId); // Update local state for styling
        onChannelClick(channelId); // Call the onChannelClick prop to update state in App.js
    };

    return (
        <aside style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Channels</h2>
                <button onClick={() => setShowAddChannelForm(true)}>+</button>
            </div>

            {showAddChannelForm && <ChannelForm onSubmit={handleAddChannel} />}

            {loading ? (
                <div>Loading channels...</div>
            ) : (
                <ChannelList
                    channels={channels}
                    onChannelClick={handleChannelClick} // Use the local handleChannelClick
                    selectedChannelId={selectedChannelId} // Pass local state for styling
                />
            )}
        </aside>
    );
}

export default ChannelView;