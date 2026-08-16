// Theme plumbing: the storage key used to persist the chosen theme and the
// React context object that carries the current theme value down to children.
// The actual state lives in ThemeProvider.jsx; consumers read it via use-theme.js.
import { createContext } from "react";

// localStorage key under which the current theme ("light" | "dark") is saved.
export const THEME_STORAGE_KEY = "pollaris-theme";

// Context created with a null default; it is given a real value by
// <ThemeProvider> higher up the tree. Reading it without a provider throws
// (enforced in use-theme.js).
export const ThemeContext = createContext(null);
