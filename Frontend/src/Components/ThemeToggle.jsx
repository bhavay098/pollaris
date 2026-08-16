// ThemeToggle: the button in the navbar/topbar that switches between light
// and dark mode. Shows a sun when it's dark (click to go light) and a moon
// when it's light, so the icon always hints at what happens next.
import { useTheme } from "./use-theme.js";

// Decorative sun icon shown while the app is in dark mode.
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

// Decorative moon icon shown while the app is in light mode.
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="theme-icon">
      <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  // Icon shows the mode we'd switch INTO (moon while light, sun while dark).
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="theme-toggle-icon">{theme === "dark" ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  );
}
