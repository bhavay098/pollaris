// Registration page (route "/register"). Same structure as Login: collects
// name/email/password, creates the account, then goes to the redirect target or dashboard.
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import GoogleIcon from "../Components/ui/GoogleIcon.jsx";
import PasswordInput from "../Components/ui/PasswordInput.jsx";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <input
                id="register-name"
                autoComplete="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                autoComplete="email"
                placeholder="you@company.com"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <PasswordInput
                id="register-password"
                label="Password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                showStrength
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>

            {error ? <p className="alert alert-error text-xs" role="alert">{error}</p> : null}

            <button type="submit" disabled={loading} className="btn btn-primary gap-2">
              <UserPlus className="h-4 w-4" />
              <span>{loading ? "Creating account…" : "Create account"}</span>
            </button>

            <div className="auth-divider">or continue with</div>

            <button type="button" disabled={loading} onClick={onGoogleSignup} className="btn btn-secondary">
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>
          <p className="form-footer">Have an account? <Link className="link-accent" to={loginLink}>Log in</Link></p>
        </form>
      </div>
    </AppShell>
  );
}
