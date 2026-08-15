import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell({ children, mainClassName = "" }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="app-atmosphere" aria-hidden="true" />
      <header className="app-topbar">
        <Link to="/" className="app-brand" aria-label="Pollaris home">
          <span className="brand-mark">P</span>
          <span>
            <span className="brand-name">Pollaris</span>
            <span className="brand-caption">Realtime intelligence</span>
          </span>
        </Link>

        <div className="app-topbar-tools">
          <span className="workspace-label">Workspace / Live</span>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className={`app-main ${mainClassName}`.trim()}>{children}</main>
    </div>
  );
}
