// Central Better Auth configuration shared by every route/middleware that
// needs session handling. Uses MongoDB as the session and account store.

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { sendPasswordResetEmail } from "../utils/email.js";

const databaseUrl = process.env.MONGODB_URI;

// Fail fast at startup if the DB connection string is missing — a running
// server with no database would be useless and confusing.
if (!databaseUrl) {
  throw new Error("MONGODB_URI is required for Better Auth");
}

const mongoClient = new MongoClient(databaseUrl);
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Google sign-in is only enabled when both env vars are present; otherwise
// the poll creator can still sign up with email + password.
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {};


const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Pollaris",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
  database: mongodbAdapter(mongoClient.db()),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        url,
        userName: user.name,
      });
    },
  },
  socialProviders,
  // Cross-domain OAuth: frontend (Vercel) and backend (Render) are on different
  // domains, so cookies must use SameSite=None + Secure to survive the Google
  // redirect. Only applied in production since localhost doesn't use HTTPS.
  ...(isProduction && {
    advanced: {
      useSecureCookies: true,
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
  }),
});
