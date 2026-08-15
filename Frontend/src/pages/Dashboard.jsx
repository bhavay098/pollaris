// Authenticated dashboard (route "/dashboard"): lists the current user's polls
// with links to edit, view analytics, open the public link, or create a new poll.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
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

  const publishPoll = async (pollId) => {
    setError("");
    setPublishingId(pollId);

    try {
      await api.publishPoll(pollId);
      setPolls((currentPolls) =>
        currentPolls.map((poll) =>
          poll.id === pollId ? { ...poll, isPublished: true } : poll,
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishingId(null);
    }
  };

  const sharePoll = async (poll) => {
    const publicUrl = `${window.location.origin}/p/${poll.slug}`;
    setError("");
    setSharingId(poll.id);

    try {
      if (navigator.share) {
        await navigator.share({ title: poll.title, url: publicUrl });
      } else {
        await navigator.clipboard.writeText(publicUrl);
      }
    } catch (err) {
      // Closing the native share sheet is not an error.
      if (err?.name !== "AbortError") setError("Unable to share the poll link");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Command center / overview</span>
          <h1 className="page-title">Your questions, in motion.</h1>
          <p className="page-description">Welcome back, {user?.name}. Keep a clear view of what is live, what is still taking shape, and where the signal is strongest.</p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-primary" to="/dashboard/polls/new">Create poll</Link>
          <button className="btn btn-quiet" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="stat-grid" aria-label="Poll overview">
        <div className="stat-card"><span className="stat-label">Polls in space</span><strong className="stat-value">{polls.length}</strong></div>
        <div className="stat-card"><span className="stat-label">Live now</span><strong className="stat-value success">{polls.filter((poll) => poll.isPublished).length}</strong></div>
        <div className="stat-card"><span className="stat-label">Responses</span><strong className="stat-value">{polls.reduce((total, poll) => total + (poll.totalResponses || 0), 0)}</strong></div>
        <div className="stat-card"><span className="stat-label">Mode</span><strong className="stat-value accent">Live</strong></div>
      </div>

      {loading ? <div className="panel muted">Syncing your poll space...</div> : null}
      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

      {!loading && polls.length > 0 ? (
        <div className="poll-list">
          {polls.map((poll) => (
            <article key={poll.id} className="poll-card">
              <div className="card-heading">
                <div>
                  <h2 className="poll-card-title">{poll.title}</h2>
                  <p className="poll-slug">/{poll.slug}</p>
                </div>
                <div className="poll-meta">
                  <span>{poll.totalResponses} responses</span>
                  <span className={`status-chip ${poll.isPublished ? "live" : "draft"}`}>{poll.isPublished ? "Published" : "Draft"}</span>
                </div>
              </div>
              <div className="card-actions" style={{ marginTop: "20px" }}>
                <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/edit`}>Edit poll</Link>
                <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/analytics`}>View analytics</Link>
                {!poll.isPublished ? (
                  <button className="btn btn-primary" type="button" disabled={publishingId === poll.id} onClick={() => void publishPoll(poll.id)}>
                    {publishingId === poll.id ? "Publishing..." : "Publish poll"}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-primary" type="button" disabled={sharingId === poll.id} onClick={() => void sharePoll(poll)}>
                      {sharingId === poll.id ? "Sharing..." : "Share poll"}
                    </button>
                    <Link className="btn btn-quiet" to={`/p/${poll.slug}`} target="_blank" rel="noreferrer">Open public link</Link>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && polls.length === 0 ? <div className="empty-state"><strong>Your first signal starts here.</strong>Create a poll to begin collecting responses.</div> : null}
    </AppShell>
  );
}
