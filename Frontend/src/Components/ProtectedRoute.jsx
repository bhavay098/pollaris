// Gatekeeper for private routes (see App.jsx). Renders its children only when
// the user is logged in; otherwise redirects to /login.
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  // While the session is still being fetched, show a placeholder so we don't
  // flash a redirect to /login for logged-in users.
  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-white p-8">Loading...</div>;
  }

  // Not authenticated -> bounce to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
