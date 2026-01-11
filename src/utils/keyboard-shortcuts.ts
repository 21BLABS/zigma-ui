/**
 * Keyboard Shortcuts
 * Global keyboard shortcuts for Zigma Terminal
 */

import { useEffect } from 'react';

export const SHORTCUTS = {
  // Navigation
  'Alt+h': 'Go to Home',
  'Alt+m': 'Go to Manifesto',
  'Alt+a': 'Go to Analytics',
  'Alt+s': 'Go to Signals',
  'Alt+b': 'Go to Backtesting',
  'Alt+w': 'Go to Watchlist',
  'Alt+v': 'Go to Visualization',
  'Alt+l': 'Go to Logs',
  'Alt+d': 'Go to Docs',
  'Alt+c': 'Go to Chat',
  
  // Actions
  'Alt+r': 'Refresh current page',
  'Alt+f': 'Focus search/input',
  'Alt+e': 'Export data',
  'Escape': 'Close modal/dialog',
  
  // Utility
  'Alt+?': 'Show keyboard shortcuts',
  'Alt+k': 'Toggle keyboard shortcuts help',
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;

export const getShortcutDescription = (key: string): string => {
  return SHORTCUTS[key as ShortcutKey] || 'Unknown shortcut';
};

export const formatShortcut = (key: string): string => {
  return key
    .replace('Alt', 'Alt')
    .replace('Control', 'Ctrl')
    .replace('Shift', 'Shift')
    .replace('+', ' + ');
};

export const isShortcutPressed = (event: KeyboardEvent, shortcut: string): boolean => {
  const parts = shortcut.split('+');
  const hasAlt = parts.includes('Alt');
  const hasCtrl = parts.includes('Control') || parts.includes('Ctrl');
  const hasShift = parts.includes('Shift');
  const keyPart = parts[parts.length - 1].toLowerCase();
  
  return (
    event.altKey === hasAlt &&
    event.ctrlKey === hasCtrl &&
    event.shiftKey === hasShift &&
    event.key.toLowerCase() === keyPart
  );
};

export const useKeyboardShortcuts = (
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      Object.entries(shortcuts).forEach(([shortcut, handler]) => {
        if (isShortcutPressed(event, shortcut)) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};
