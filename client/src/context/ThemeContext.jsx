import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {}
});

const THEME_STORAGE_KEY = 'reservex-theme';

/**
 * Provides persistent Light/Dark mode state and smooth cross-element theme transitions.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage access restrictions
    }
    return 'dark';
  });

  const applyDocumentTheme = useCallback((nextTheme, animate = false) => {
    const root = document.documentElement;
    if (animate) {
      root.classList.add('theme-transitioning');
    }

    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
    root.setAttribute('data-theme', nextTheme);
    root.style.colorScheme = nextTheme;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage write errors
    }

    if (animate) {
      window.setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 360);
    }
  }, []);

  useEffect(() => {
    applyDocumentTheme(theme, false);
  }, [theme, applyDocumentTheme]);

  const setTheme = useCallback(
    (nextTheme) => {
      if (nextTheme !== 'light' && nextTheme !== 'dark') return;
      applyDocumentTheme(nextTheme, true);
      setThemeState(nextTheme);
    },
    [applyDocumentTheme]
  );

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyDocumentTheme(next, true);
    setThemeState(next);
    return next;
  }, [theme, applyDocumentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
