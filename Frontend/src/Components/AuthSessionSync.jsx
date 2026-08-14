// Renders nothing. Its job is to bridge better-auth's session into the
// Zustand auth store so the whole app can read `user` via useAuthStore.
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { useAuthStore } from "../store/auth-store";

export default function AuthSessionSync() {
  // better-auth hook that subscribes to the current session; `refetch` lets
  // us manually re-pull it later (used after login/logout).
  const { data: session, isPending: loading, refetch } = authClient.useSession();
  const setSession = useAuthStore((state) => state.setSession);
  const setSessionRefetch = useAuthStore((state) => state.setSessionRefetch);

  // Keep the store's user/loading state in sync whenever the session changes.
  useEffect(() => {
    setSession(session, loading);
  }, [loading, session, setSession]);

  // Expose `refetch` to the store so its login/logout actions can call it.
  useEffect(() => {
    setSessionRefetch(refetch);
  }, [refetch, setSessionRefetch]);

  return null;
}
