import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        
        // Only check modifiers that are explicitly specified in the shortcut
        // Support both Ctrl on Windows/Linux and Cmd (metaKey) on Mac for ctrl modifier
        const ctrlMatches = shortcut.ctrl === undefined 
          ? true 
          : shortcut.ctrl 
            ? (event.ctrlKey || event.metaKey) 
            : !(event.ctrlKey || event.metaKey);
        
        const shiftMatches = shortcut.shift === undefined
          ? true
          : shortcut.shift
            ? event.shiftKey
            : !event.shiftKey;
        
        const altMatches = shortcut.alt === undefined
          ? true
          : shortcut.alt
            ? event.altKey
            : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function getShortcutLabel(shortcut: Omit<KeyboardShortcut, 'handler'>): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  
  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
}
