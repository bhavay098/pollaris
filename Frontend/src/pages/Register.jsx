// Registration page (route "/register"). Same structure as Login: collects
// name/email/password, creates the account, then goes to the redirect target or dashboard.
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import GoogleIcon from "../Components/ui/GoogleIcon.jsx";

export default function Register() {
  // Single state object for the three form fields.
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Email/password signup: create the account, then go to redirect target or dashboard.
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      // Keep the user on the form and show why registration failed.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google signup: redirects to Google; on failure we stay and show the error.
  const onGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(redirectUrl);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loginLink = `/login${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`;

  return (
    <AppShell mainClassName="auth-main">
      <div className="auth-layout">
        <section className="auth-visual" aria-labelledby="register-heading">
          <span className="eyebrow">Start a signal / 02</span>
          <h1 id="register-heading" className="page-title">Make every response easier to act on.</h1>
          <p className="page-description">Create a focused workspace for the questions that matter. Your first poll is only a few considered fields away.</p>
        </section>

        <form onSubmit={onSubmit} className="auth-card">
          <span className="eyebrow">New workspace</span>
          <h2>Create your account</h2>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="register-name">Name</label>
              <input id="register-name" autoComplete="name" placeholder="Your name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input id="register-email" autoComplete="email" placeholder="you@company.com" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="register-password">Password</label>
              <input id="register-password" autoComplete="new-password" placeholder="At least 8 characters" type="password" minLength={8} required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Creating account…" : "Create account"}</button>
            <div className="auth-divider">or continue with</div>
            <button type="button" disabled={loading} onClick={onGoogleSignup} className="btn btn-secondary"><GoogleIcon /> Continue with Google</button>
          </div>
          <p className="form-footer">Have an account? <Link className="link-accent" to={loginLink}>Log in</Link></p>
        </form>
      </div>
    </AppShell>
  );
}
