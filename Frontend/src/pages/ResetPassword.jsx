// Reset Password page (route "/reset-password").
// Handles setting a new password via the verification token sent via email.
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";
import AppShell from "../Components/AppShell.jsx";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInvalidToken = !token || errorParam === "INVALID_TOKEN";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to reset password.");
      }

      toast.success("Password updated successfully! Please log in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell mainClassName="auth-main">
      <div className="auth-layout">
        <section className="auth-visual" aria-labelledby="reset-heading">
          <span className="eyebrow">Security / 04</span>
          <h1 id="reset-heading" className="page-title">
            Choose a strong, memorable new password.
          </h1>
          <p className="page-description">
            Your new password will immediately secure your account and revoke previous unauthenticated sessions.
          </p>
          <ul className="signal-list">
            <li>Minimum of 8 characters for security.</li>
            <li>Instant update and direct return to your workflow.</li>
          </ul>
        </section>

        <div className="auth-card">
          {isInvalidToken ? (
            <div>
              <span className="eyebrow">Invalid or expired link</span>
              <h2>Link is no longer valid</h2>
              <div className="form-stack">
                <p className="page-description" style={{ margin: "0.5rem 0 1rem" }}>
                  This password reset link is invalid or has already expired. Password reset links are valid for 1 hour from when they are requested.
                </p>
                <Link to="/forgot-password" className="btn btn-primary" style={{ textAlign: "center", display: "block" }}>
                  Request a new link
                </Link>
              </div>
              <p className="form-footer">
                Back to <Link className="link-accent" to="/login">Log in</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <span className="eyebrow">New credentials</span>
              <h2>Set new password</h2>
              <div className="form-stack">
                <div className="field">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    placeholder="At least 8 characters"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    placeholder="Re-enter your new password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "Resetting password…" : "Reset password"}
                </button>
              </div>
              <p className="form-footer">
                Remember your password? <Link className="link-accent" to="/login">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
