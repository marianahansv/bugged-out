// contains the default smoke test for the react app.
// this file verifies that the main application title renders successfully.

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /buggedout/i })).toBeInTheDocument();
});
