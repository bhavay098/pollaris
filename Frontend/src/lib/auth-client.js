// better-auth client for email/password and Google authentication.
// It talks to the auth server at VITE_AUTH_BASE_URL (the backend) and manages
// the user's session cookie for us.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:3000",
});
