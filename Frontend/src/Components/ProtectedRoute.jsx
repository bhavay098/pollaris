// Gatekeeper for private routes (see App.jsx). Renders its children only when
// the user is logged in; otherwise redirects to /login.
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "./AppShell.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  // While the session is still being fetched, show a placeholder so we don't
  // flash a redirect to /login for logged-in users.
  if (loading) {
    return (
      <AppShell>
        <div className="panel muted">Checking your workspace…</div>
      </AppShell>
    );
  }

  // Not authenticated -> bounce to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
