// Login page (route "/login"). Email/password form plus a Google option.
// On success it navigates to the redirect target or dashboard.
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import GoogleIcon from "../Components/ui/GoogleIcon.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(redirectUrl);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const registerLink = `/register${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`;
  const forgotPasswordLink = `/forgot-password${redirectUrl !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`;

  return (
    <AppShell mainClassName="auth-main">
      <div className="auth-layout">
        <section className="auth-visual" aria-labelledby="login-heading">
          <span className="eyebrow">Signal access / 01</span>
          <h1 id="login-heading" className="page-title">See what your audience is saying, in real time.</h1>
          <p className="page-description">Sign in to pick up where you left off, monitor active polls, and turn responses into a clear next move.</p>
        </section>

        <form onSubmit={onSubmit} className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h2>Log in to Pollaris</h2>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" placeholder="you@company.com" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" placeholder="Your password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link to={forgotPasswordLink} className="link-accent" style={{ fontSize: "0.8125rem" }}>
                  Forgot password?
                </Link>
              </div>
            </div>
            {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Logging in…" : "Log in"}</button>
            <div className="auth-divider">or continue with</div>
            <button type="button" disabled={loading} onClick={onGoogleLogin} className="btn btn-secondary"><GoogleIcon /> Continue with Google</button>
          </div>
          <p className="form-footer">No account? <Link className="link-accent" to={registerLink}>Create one</Link></p>
        </form>
      </div>
    </AppShell>
  );
}
