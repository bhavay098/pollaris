// Gatekeeper for private routes (see App.jsx). Renders its children only when
// the user is logged in; otherwise redirects to /login with a return URL.
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "./AppShell.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  // While the session is still being fetched, show a placeholder so we don't
  // flash a redirect to /login for logged-in users.
  if (loading) {
    return (
      <AppShell>
        <div className="panel muted">Checking your workspace…</div>
      </AppShell>
    );
  }

  // Not authenticated -> bounce to login with return target.
  if (!user) {
    const returnUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return children;
}
