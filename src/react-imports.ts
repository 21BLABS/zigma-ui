/**
 * Global React imports
 * This file ensures React is properly imported and available globally
 */

import React from 'react';
import ReactDOM from 'react-dom';

// Declare types for window object
declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
  }
}

// Make React available globally
window.React = React;
window.ReactDOM = ReactDOM;

export { React, ReactDOM };
