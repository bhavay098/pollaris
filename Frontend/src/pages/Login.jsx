// Login page (route "/login"). Email/password form plus a Google option.
// On success it navigates to the dashboard.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";

export default function Login() {
  // Local form state; `error` shows any auth failure, `loading` disables
  // buttons while a request is in flight.
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Auth actions come from the global store.
  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      // Show the backend error message on the form.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      // OAuth redirects away from the page; if it fails we stay and show the error.
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="auth-layout">
        <section className="auth-visual" aria-labelledby="login-heading">
          <span className="eyebrow">Signal access / 01</span>
          <h1 id="login-heading" className="page-title">See what your audience is saying, in real time.</h1>
          <p className="page-description">Sign in to pick up where you left off, monitor active polls, and turn responses into a clear next move.</p>
          <ul className="signal-list">
            <li>Live response streams, without the spreadsheet sprawl.</li>
            <li>Poll spaces that stay clear from first draft to final result.</li>
          </ul>
        </section>

        <form onSubmit={onSubmit} className="auth-card">
          <span className="eyebrow">Welcome back</span>
          <h2>Log in to PulsePoll</h2>
          <div className="form-stack">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" placeholder="you@company.com" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" placeholder="Your password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Logging in..." : "Log in"}</button>
            <div className="auth-divider">or continue with</div>
            <button type="button" disabled={loading} onClick={onGoogleLogin} className="btn btn-secondary">Google</button>
          </div>
          <p className="form-footer">No account? <Link className="link-accent" to="/register">Create one</Link></p>
        </form>
      </div>
    </AppShell>
  );
}
