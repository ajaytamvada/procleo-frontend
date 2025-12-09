import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeConfig } from '@/lib/theme';
import { applyTheme, resolveTheme } from '@/lib/theme';

const STORAGE_KEY = 'autovitica-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeProviderContext = createContext<ThemeConfig | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    // Always force light theme - ignore localStorage
    return 'light';
  });

  const resolvedTheme = 'light'; // Always resolve to light theme

  useEffect(() => {
    applyTheme('light');

    // Always remove dark class from html element
    const root = document.documentElement;
    root.classList.remove('dark');

    // Clear any stored dark theme preference
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Removed system theme listener - always use light mode

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value: ThemeConfig = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme(): ThemeConfig {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
