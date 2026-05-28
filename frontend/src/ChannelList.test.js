import { render, screen, fireEvent } from '@testing-library/react';
import ChannelList from './ChannelList';

describe('ChannelList', () => {
  const mockChannels = [
    { id: 1, channel_name: 'General' },
    { id: 2, channel_name: 'Random' },
    { id: 3, channel_name: 'Tech' },
  ];

  const mockOnChannelClick = jest.fn();

  test('renders channel names correctly', () => {
    render(
      <ChannelList
        channels={mockChannels}
        onChannelClick={mockOnChannelClick}
        selectedChannelId={null}
      />
    );

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Random')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  test('highlights the selected channel', () => {
    render(
      <ChannelList
        channels={mockChannels}
        onChannelClick={mockOnChannelClick}
        selectedChannelId={2}
      />
    );

    const selectedChannel = screen.getByText('Random').closest('.channel-item');
    expect(selectedChannel).toHaveClass('is-selected');

    const unselectedChannel = screen.getByText('General').closest('.channel-item');
    expect(unselectedChannel).not.toHaveClass('is-selected');
  });

  test('calls onChannelClick when a channel is clicked', () => {
    render(
      <ChannelList
        channels={mockChannels}
        onChannelClick={mockOnChannelClick}
        selectedChannelId={null}
      />
    );

    fireEvent.click(screen.getByText('Tech'));
    expect(mockOnChannelClick).toHaveBeenCalledTimes(1);
    expect(mockOnChannelClick).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByText('General'));
    expect(mockOnChannelClick).toHaveBeenCalledTimes(2);
    expect(mockOnChannelClick).toHaveBeenCalledWith(1);
  });

  test('renders an empty list when no channels are provided', () => {
    render(
      <ChannelList
        channels={[]}
        onChannelClick={mockOnChannelClick}
        selectedChannelId={null}
      />
    );
    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });
});
