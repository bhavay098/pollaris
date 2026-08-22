// Forgot Password page (route "/forgot-password").
// Lets unauthenticated users request a password reset link to their email.
import { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import AppShell from "../Components/AppShell.jsx";
import { Send, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await authClient.forgetPassword({
        email,
        redirectTo,
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to send reset link");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell mainClassName="auth-main">
      <div className="auth-layout">
        <section className="auth-visual" aria-labelledby="forgot-heading">
          <span className="eyebrow">Account recovery / 03</span>
          <h1 id="forgot-heading" className="page-title">
            Regain access to your Pollaris workspace.
          </h1>
          <p className="page-description">
            Enter the email address tied to your account and we&apos;ll send you
            a secure link to reset your password.
          </p>
          <ul className="signal-list">
            <li>Secure, one-time recovery links with automatic expiration.</li>
            <li>No interruption to your active polls or incoming responses.</li>
          </ul>
        </section>

        <div className="auth-card">
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="eyebrow">Email sent</span>
              <h2 className="text-xl font-bold">Check your inbox</h2>
              <div className="form-stack">
                <p className="text-xs text-[var(--app-muted)] leading-relaxed">
                  We&apos;ve sent password reset instructions to{" "}
                  <strong className="text-[var(--app-text)]">{email}</strong>. Please check your inbox and click
                  the link to proceed.
                </p>
                <div className="alert text-xs text-[var(--app-subtle)] border border-[var(--app-border)] bg-[var(--app-surface-raised)]" role="status">
                  The link will expire in 1 hour. If you don&apos;t see the email, check your spam or junk folder.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setError("");
                  }}
                  className="btn btn-secondary text-xs"
                >
                  Send to a different email
                </button>
              </div>
              <p className="form-footer">
                Remember your password?{" "}
                <Link className="link-accent" to="/login">
                  Log in
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <span className="eyebrow">Password recovery</span>
              <h2>Forgot your password?</h2>
              <p className="text-xs text-[var(--app-muted)] mt-1 mb-4 leading-relaxed">
                Enter your email address and we will send you a link to reset your password.
              </p>
              <div className="form-stack">
                <div className="field">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error ? (
                  <p className="alert alert-error text-xs" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? "Sending reset link…" : "Send reset link"}</span>
                </button>
              </div>
              <p className="form-footer">
                Remember your password?{" "}
                <Link className="link-accent" to="/login">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
