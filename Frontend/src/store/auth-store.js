// Global auth state using Zustand. Any component can read the current user with useAuthStore((state) => state.user) and call the auth actions.

// The actual session source of truth is better-auth (authClient). This store mirrors it into React state and exposes wrapper actions that re-sync the session after login/logout/register.

import { create } from "zustand";
import { authClient } from "../lib/auth-client";

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

    if (error) throw new Error(error.message);

    await get().refreshMe();
    return data;
  },

  register: async (payload) => {
    const { data, error } = await authClient.signUp.email(payload);
    if (error) throw new Error(error.message);
    await get().refreshMe();
    return data;
  },

  logout: async () => {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message);
    await get().refreshMe();
  },

  // OAuth flow: better-auth redirects to Google and then back to /dashboard.
  loginWithGoogle: async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) throw new Error(error.message);
  },

  // Re-fetch the session from better-auth so user/loading state is current.
  refreshMe: async () => {
    const sessionRefetch = get().sessionRefetch;
    if (sessionRefetch) await sessionRefetch();
  },
}));
