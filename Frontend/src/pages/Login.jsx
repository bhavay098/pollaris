import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
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
        <p className="text-sm text-zinc-400">No account? <Link className="text-teal-400" to="/register">Register</Link></p>
      </form>
    </div>
  );
}
