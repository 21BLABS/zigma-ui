/**
 * React initialization file
 * This ensures React is properly loaded and available globally before any components are rendered
 */

// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom';

// Make React available globally
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
  
  console.log('React initialized globally:', React.version);
}

export { React, ReactDOM };
