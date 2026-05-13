const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export { API_BASE_URL };
