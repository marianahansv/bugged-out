// This file configures Bun's test runner for frontend React tests.
// It enables the DOM environment globally and imports custom matchers.

// Import @testing-library/jest-dom for extended matchers
import '@testing-library/jest-dom';

export default {
  test: {
    // Enable a DOM environment for all tests
    environment: 'jsdom'
  }
};
````
