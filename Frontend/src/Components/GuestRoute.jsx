// Gatekeeper for auth pages (Login/Register). Renders children only when
// there is no signed-in user; otherwise sends already-authenticated users
// straight to the redirect target or dashboard.
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // While the session is still being fetched, render nothing so a logged-in
  // user doesn't briefly flash the login form before the redirect happens.
  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
}
