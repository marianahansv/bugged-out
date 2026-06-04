// manages the sidebar channel experience.
// this file loads channels, tracks the selected channel, and shows the add-channel form.

import React, { useState, useEffect, useCallback } from 'react';
import ChannelList from './ChannelList';
import ChannelForm from './ChannelForm';
import { apiUrl } from './api';

function ChannelView({ onChannelClick }) {
    const [showAddChannelForm, setShowAddChannelForm] = useState(false);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [error, setError] = useState('');

    const fetchChannels = useCallback(() => {
        setLoading(true);
        setError('');
        fetch(apiUrl('/getallchannels'))
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
                setError('We could not load channels right now.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    const handleAddChannel = (channelName) => {
        if (channelName.trim() === '') return;

        fetch(apiUrl('/addchannel'), {
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
        setSelectedChannelId(channelId);
        onChannelClick(channelId);
    };

    return (
        <aside className="sidebar">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Channels</h2>
                </div>
                <button className="ghost-button" onClick={() => setShowAddChannelForm(true)}>+</button>
            </div>

            {showAddChannelForm && <ChannelForm onSubmit={handleAddChannel} />}

            {error ? (
                <div className="error-text">{error}</div>
            ) : loading ? (
                <div>Loading channels...</div>
            ) : (
                <ChannelList
                    channels={channels}
                    onChannelClick={handleChannelClick}
                    selectedChannelId={selectedChannelId}
                />
            )}
        </aside>
    );
}

export default ChannelView;
