// useTheme hook: the one way components read the current theme. Wraps
// useContext(ThemeContext) and fails loudly if a component tries to use it
// outside of <ThemeProvider> (a silent null would be confusing to debug).
import { useContext } from "react";
import { ThemeContext } from "./theme-context.js";

export function useTheme() {
  const context = useContext(ThemeContext);

  // ThemeProvider always provides an object; null here means the hook was
  // used outside the provider tree.
  if (!context) throw new Error("useTheme must be used within ThemeProvider");

  // Returns { theme, toggleTheme } from the provider's value.
  return context;
}
