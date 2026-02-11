// Patch for Vite client to fix "react is not defined" error
// This file should be imported before any other code

// Define react globally if it doesn't exist
if (typeof window !== 'undefined') {
  // Create minimal mock implementation if React isn't loaded yet
  if (!window.react && !window.React) {
    const mockReact = {
      createElement: function() { return {}; },
      Fragment: Symbol('Fragment'),
      version: '18.3.1'
    };
    
    // Assign to both lowercase and uppercase variants
    window.react = mockReact;
    window.React = mockReact;
    
    console.log('[Vite Client Patch] Added React polyfill');
  }
}
