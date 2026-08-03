import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
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
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>
        <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Password" type="password" minLength={8} required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 rounded-xl p-3 font-semibold">{loading ? "Creating account..." : "Register"}</button>
        <button type="button" disabled={loading} onClick={onGoogleSignup} className="w-full border border-zinc-700 hover:bg-zinc-800 rounded-xl p-3 font-semibold">Continue with Google</button>
        <p className="text-sm text-zinc-400">Have an account? <Link className="text-teal-400" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
