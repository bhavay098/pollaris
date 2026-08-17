// Global auth state using Zustand. Any component can read the current user with useAuthStore((state) => state.user) and call the auth actions.

// The actual session source of truth is better-auth (authClient). This store mirrors it into React state and exposes wrapper actions that re-sync the session after login/logout/register.

import { create } from "zustand";
import { authClient } from "../lib/auth-client";

const handleAuthError = (error) => {
  if (!error) return new Error("Authentication failed");
  if (
    error.status === 429 ||
    error.message?.toLowerCase().includes("too many requests") ||
    error.message?.toLowerCase().includes("rate limit")
  ) {
    return new Error(
      error.message || "Too many authentication attempts. Please wait a few minutes before trying again."
    );
  }
  return new Error(error.message || "Authentication failed");
};

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  // Stored refetch function so actions here can re-pull the session from better-auth after login/logout. Populated by AuthSessionSync.
  sessionRefetch: null,

  // Called by AuthSessionSync whenever better-auth's session changes.
  setSession: (session, loading) =>
    set({
      user: session?.user || null,
      loading,
    }),

  setSessionRefetch: (sessionRefetch) => set({ sessionRefetch }),

  login: async (payload) => {
    const { data, error } = await authClient.signIn.email(payload);

    if (error) throw handleAuthError(error);

    await get().refreshMe();
    return data;
  },

  register: async (payload) => {
    const { data, error } = await authClient.signUp.email(payload);
    if (error) throw handleAuthError(error);
    await get().refreshMe();
    return data;
  },

  logout: async () => {
    const { error } = await authClient.signOut();
    if (error) throw handleAuthError(error);
    await get().refreshMe();
  },

  // OAuth flow: better-auth redirects to Google and then back to redirectPath (defaults to /dashboard).
  loginWithGoogle: async (redirectPath = "/dashboard") => {
    const target = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    const callbackURL = `${window.location.origin}${target}`;
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    if (error) throw handleAuthError(error);
  },

  // Re-fetch the session from better-auth so user/loading state is current.
  refreshMe: async () => {
    const sessionRefetch = get().sessionRefetch;
    if (sessionRefetch) await sessionRefetch();
  },
}));
