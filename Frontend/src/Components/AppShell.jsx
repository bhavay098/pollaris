import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AppShell({ children, mainClassName = "" }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to sign out right now.");
    }
  };

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
          {user ? (
            <button className="btn btn-quiet app-signout" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" className={`app-main ${mainClassName}`.trim()}>{children}</main>
    </div>
  );
}
