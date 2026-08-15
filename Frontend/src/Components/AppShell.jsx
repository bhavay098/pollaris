import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell({ children, mainClassName = "" }) {
  return (
    <div className="app-shell">
      <div className="app-atmosphere" aria-hidden="true" />
      <header className="app-topbar">
        <Link to="/dashboard" className="app-brand" aria-label="PulsePoll dashboard">
          <span className="brand-mark">P</span>
          <span>
            <span className="brand-name">PulsePoll</span>
            <span className="brand-caption">Realtime intelligence</span>
          </span>
        </Link>

        <div className="app-topbar-tools">
          <span className="workspace-label">Workspace / Live</span>
          <ThemeToggle />
        </div>
      </header>

      <main className={`app-main ${mainClassName}`.trim()}>{children}</main>
    </div>
  );
}
