import { render, screen, fireEvent } from '@testing-library/react';
import ChannelForm from './ChannelForm';

describe('ChannelForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders the input field and button', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('New channel name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add channel/i })).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('New channel name');

    fireEvent.change(input, { target: { value: 'Test Channel' } });
    expect(input).toHaveValue('Test Channel');
  });

  test('calls onSubmit with the new channel name on form submission', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('New channel name');
    const button = screen.getByRole('button', { name: /add channel/i });

    fireEvent.change(input, { target: { value: 'Test Channel' } });
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('Test Channel');
    expect(input).toHaveValue(''); // Input should be cleared after submission
  });

  test('calls onSubmit on Enter key press', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('New channel name');

    fireEvent.change(input, { target: { value: 'Another Channel' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('Another Channel');
    expect(input).toHaveValue(''); // Input should be cleared after submission
  });

  test('does not call onSubmit if channel name is empty on submission', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);
    const button = screen.getByRole('button', { name: /add channel/i });

    fireEvent.click(button); // Submit with empty input

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('New channel name')).toHaveValue('');
  });

  test('does not call onSubmit if channel name is only whitespace on submission', () => {
    render(<ChannelForm onSubmit={mockOnSubmit} />);
    const input = screen.getByPlaceholderText('New channel name');
    const button = screen.getByRole('button', { name: /add channel/i });

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button); // Submit with whitespace input

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('New channel name')).toHaveValue('');
  });
});
