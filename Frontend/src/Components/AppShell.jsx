// AppShell: the shared layout wrapper for logged-in pages (Dashboard, Settings,
// auth pages). Renders the top navigation bar and a "skip to content" link for
// keyboard/assistive-tech users, then puts its children inside <main>.
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import ThemeToggle from "./ThemeToggle.jsx";
import UserDropdown from "./common/UserDropdown.jsx";

export default function AppShell({ children, mainClassName = "", breadcrumb = null }) {
  const { user } = useAuthStore();

  return (
    <div className="app-shell">
      {/* Skip link lets keyboard users jump straight to the content. */}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {/* Decorative animated background, hidden from screen readers. */}
      <div className="app-atmosphere" aria-hidden="true" />
      <header className="app-topbar">
        {/* Brand block links back to the marketing home page or dashboard. */}
        <div className="flex items-center gap-4">
          <Link to={user ? "/dashboard" : "/"} className="app-brand" aria-label="Pollaris home">
            <span className="brand-mark">P</span>
            <span>
              <span className="brand-name">Pollaris</span>
              <span className="brand-caption">Realtime intelligence</span>
            </span>
          </Link>
          {breadcrumb && (
            <div className="hidden md:flex items-center gap-2 text-xs text-[var(--app-muted)] pl-4 border-l border-[var(--app-border)]">
              {breadcrumb}
            </div>
          )}
        </div>

        <div className="app-topbar-tools">
          {/* Live WebSocket sync pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_60%,transparent)] text-[11px] font-medium text-[var(--app-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--app-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--app-primary)]"></span>
            </span>
            <span>Live Sync</span>
          </div>

          <ThemeToggle />

          {/* User profile dropdown if signed in, or Login button */}
          {user ? (
            <UserDropdown />
          ) : (
            <Link to="/login" className="btn btn-primary text-xs py-1.5 px-4 min-h-[38px]">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* The page-specific content is passed in as children by the route. */}
      <main id="main-content" className={`app-main ${mainClassName}`.trim()}>
        {children}
      </main>
    </div>
  );
}
