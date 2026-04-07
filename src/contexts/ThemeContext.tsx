import React, { createContext, useContext, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import type { Theme } from '../lib';
import { useSpace } from '../store';
import { getTheme } from '../utils';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getTheme());
  const { updateConfig } = useSpace();
  const spaceTheme = useSpace(
    useShallow((state) => state?.space?.config?.theme),
  );

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    updateConfig({ theme: newTheme });
  };

  // Sync local theme state when a space is loaded whose saved theme
  // differs from the current ThemeProvider state (e.g. on initial load).
  useEffect(() => {
    if (spaceTheme && spaceTheme !== theme) {
      setTheme(spaceTheme);
    }
    // Only react to the store's theme changing, not to `theme` itself,
    // to avoid a loop when the user manually toggles the theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
