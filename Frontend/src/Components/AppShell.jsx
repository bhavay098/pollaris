// AppShell: the shared layout wrapper for logged-in pages (Dashboard, Settings,
// auth pages). Renders the top navigation bar and a "skip to content" link for
// keyboard/assistive-tech users, then puts its children inside <main>.
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import ThemeToggle from "./ThemeToggle.jsx";
import { toast } from "sonner";

export default function AppShell({ children, mainClassName = "" }) {
  // user lets the header know if we're signed in; logout clears the session.
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Sign out via the auth store, then send the user back to the login page.
  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      // Show a toast instead of crashing if sign-out fails for some reason.
      toast.error(error instanceof Error ? error.message : "Unable to sign out right now.");
    }
  };

  return (
    <div className="app-shell">
      {/* Skip link lets keyboard users jump straight to the content. */}
      <a className="skip-link" href="#main-content">Skip to content</a>
      {/* Decorative animated background, hidden from screen readers. */}
      <div className="app-atmosphere" aria-hidden="true" />
      <header className="app-topbar">
        {/* Brand block links back to the marketing home page. */}
        <Link to="/" className="app-brand" aria-label="Pollaris home">
          <span className="brand-mark">P</span>
          <span>
            <span className="brand-name">Pollaris</span>
            <span className="brand-caption">Realtime intelligence</span>
          </span>
        </Link>

        <div className="app-topbar-tools">
          {/* Static workspace badge (cosmetic). */}
          <span className="workspace-label">Workspace / Live</span>
          {/* Settings + sign out only make sense for a logged-in user. */}
          {user ? (
            <>
              <Link to="/dashboard/settings" className="btn btn-quiet app-settings-link">
                Settings
              </Link>
              <button className="btn btn-quiet app-signout" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      {/* The page-specific content is passed in as children by the route. */}
      <main id="main-content" className={`app-main ${mainClassName}`.trim()}>{children}</main>
    </div>
  );
}
