// Import jest-dom additions
require('@testing-library/jest-dom');

// Polyfill setImmediate for the router package
global.setImmediate = (callback) => setTimeout(callback, 0);

// Mock location object
let currentPath = '/';
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    get pathname() {
      return currentPath;
    },
    set pathname(value) {
      currentPath = value;
    }
  },
  writable: true
});

// Mock browser globals that might not be in jsdom
global.window.history.pushState = jest.fn((state, title, url) => {
  currentPath = url;
});
global.window.history.replaceState = jest.fn((state, title, url) => {
  currentPath = url;
});
global.window.scrollTo = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  window.history.pushState.mockClear();
  window.history.replaceState.mockClear();
  window.scrollTo.mockClear();
  
  // Reset the URL to / before each test
  currentPath = '/';
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Reset any event listeners
  window.removeEventListener = jest.fn();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 