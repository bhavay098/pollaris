// Login page (route "/login"). Email/password form plus a Google option.
// On success it navigates to the dashboard.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

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
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 rounded-xl p-3 font-semibold">{loading ? "Logging in..." : "Login"}</button>
        <button type="button" disabled={loading} onClick={onGoogleLogin} className="w-full border border-zinc-700 hover:bg-zinc-800 rounded-xl p-3 font-semibold">Continue with Google</button>
        <p className="text-sm text-zinc-400">No account? <Link className="text-teal-400" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
