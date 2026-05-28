import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import { apiUrl } from './api';

// Mock the API module
jest.mock('./api', () => ({
  apiUrl: jest.fn((path) => `http://mockapi.com${path}`),
}));

describe('LoginForm', () => {
  const mockOnLoginSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    mockOnLoginSuccess.mockClear();
    mockOnCancel.mockClear();
    apiUrl.mockClear();
    jest.spyOn(global, 'fetch').mockClear(); // Clear fetch mock
  });

  test('renders username and password fields and login button', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('updates username and password fields on change', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  test('calls onLoginSuccess on successful login', async () => {
    const mockToken = 'mock-jwt-token';
    const mockUsername = 'testuser';
    const mockDisplayName = 'Test User';

    // Mock successful fetch response
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken, username: mockUsername, display_name: mockDisplayName }),
      })
    );

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: mockUsername } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockToken, mockUsername, mockDisplayName);
    });
    expect(apiUrl).toHaveBeenCalledWith('/login');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://mockapi.com/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: mockUsername, password: 'password123' }),
      })
    );
    expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
  });

  test('displays error message on failed login', async () => {
    // Mock failed fetch response
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed: invalid credentials/i)).toBeInTheDocument();
    });
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
    expect(apiUrl).toHaveBeenCalledWith('/login');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('displays generic error message for network errors', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed: network error/i)).toBeInTheDocument();
    });
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
});
