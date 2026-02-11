/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

// Declare React globally to fix 'React is not defined' errors
import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare global {
  const React: typeof React;
  const ReactDOM: typeof ReactDOM;
}
