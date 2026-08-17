// ThemeProvider: holds the app's light/dark theme state and exposes it through
// React context. Mounted once at the app root (main.jsx) so every component
// can read the theme via useTheme().
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, ThemeContext } from "../hooks/theme-context.js";

// Decide the starting theme the first time the provider mounts:
// a saved preference wins, otherwise fall back to the OS setting.
function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function ThemeProvider({ children }) {
  // Lazy initializer: getInitialTheme only runs on the first render.
  const [theme, setTheme] = useState(getInitialTheme);

  // useLayoutEffect runs before the browser paints, so the theme class is
  // applied without a flash of the wrong theme. It also persists the choice.
  useLayoutEffect(() => {
    // CSS reads `data-theme` on <html> to switch between light/dark styles.
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Flip between the two themes (functional update avoids stale state).
  // Wrapped in useCallback so the identity is stable across renders.
  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  // Memoized so the Provider value keeps the same identity unless theme changes.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
