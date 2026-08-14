// Authenticated dashboard (route "/dashboard"): lists the current user's polls
// with links to edit, view analytics, open the public link, or create a new poll.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuthStore();

  // Load polls once when the page mounts.
  useEffect(() => {
    let cancelled = false;

    const loadPolls = async () => {
      try {
        const response = await api.getMyPolls();
        if (!cancelled) setPolls(response.data.polls);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPolls();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Poll Dashboard</h1>
            <p className="text-zinc-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Link className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-xl font-medium" to="/dashboard/polls/new">Create Poll</Link>
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl" onClick={logout}>Logout</button>
          </div>
        </header>

        {loading ? <p>Loading polls...</p> : null}
        {error ? <p className="text-red-400">{error}</p> : null}

        {/* Poll list; each card shows the title/slug and action links */}
        <div className="grid gap-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{poll.title}</h2>
                  <p className="text-zinc-400 text-sm">/{poll.slug}</p>
                </div>
                <div className="text-right text-sm text-zinc-300">
                  <p>{poll.totalResponses} responses</p>
                  <p>{poll.isPublished ? "Published" : "Not published"}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <Link className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 text-sm" to={`/dashboard/polls/${poll.id}/edit`}>Edit</Link>
                <Link className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 text-sm" to={`/dashboard/polls/${poll.id}/analytics`}>Analytics</Link>
                <a className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 text-sm" href={`/p/${poll.slug}`} target="_blank" rel="noreferrer">Open Public Link</a>
              </div>
            </div>
          ))}
          {/* Empty state, shown only after loading finishes with no polls */}
          {!loading && polls.length === 0 ? <p className="text-zinc-400">No polls yet. Create your first poll.</p> : null}
        </div>
      </div>
    </div>
  );
}
