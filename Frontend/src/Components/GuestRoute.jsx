// Gatekeeper for auth pages (Login/Register). Renders children only when
// there is no signed-in user; otherwise sends already-authenticated users
// straight to the dashboard.
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();

  // While the session is still being fetched, render nothing so a logged-in
  // user doesn't briefly flash the login form before the redirect happens.
  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
