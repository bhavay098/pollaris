// Keeps the app session limited to 24 hours of inactivity. While the user is
// signed in, we refresh a last-activity timestamp on normal browser activity
// and log them out once the window expires.
import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";

const AUTH_INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "pollaris:last-auth-activity";
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

function readLastActivity() {
  try {
    const raw = window.localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeLastActivity(timestamp) {
  try {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp));
  } catch {
    // Ignore storage failures and keep the in-memory timeout behavior.
  }
}

function clearLastActivity() {
  try {
    window.localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export default function AuthTimeoutManager() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (loading) return undefined;

    if (!user) {
      clearLastActivity();
      return undefined;
    }

    const now = Date.now();
    const lastActivity = readLastActivity();
    if (!lastActivity) writeLastActivity(now);

    const expireAt = (lastActivity ?? now) + AUTH_INACTIVITY_LIMIT_MS;

    if (expireAt <= now) {
      clearLastActivity();
      void logout().catch(() => {
        clearLastActivity();
      });
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearLastActivity();
      void logout().catch(() => {
        clearLastActivity();
      });
    }, expireAt - now);

    const markActivity = () => {
      writeLastActivity(Date.now());
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;

      const refreshed = readLastActivity();
      if (refreshed && Date.now() - refreshed >= AUTH_INACTIVITY_LIMIT_MS) {
        clearLastActivity();
        window.clearTimeout(timeoutId);
        void logout().catch(() => {
          clearLastActivity();
        });
      }
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, loading, logout]);

  return null;
}
