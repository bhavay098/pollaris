// Authenticated dashboard (route "/dashboard"): lists the current user's polls
// with links to edit, view analytics, open the public link, or create a new poll.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";
import Skeleton from "../Components/ui/Skeleton.jsx";

export default function Dashboard() {
  // The current user's list of polls.
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track WHICH poll each async action is running on so the right button can
  // show a loading state and be disabled while its request is in flight.
  const [publishingId, setPublishingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [publishingResultsId, setPublishingResultsId] = useState(null);
  const [unpublishingResultsId, setUnpublishingResultsId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuthStore();

  // Load polls once when the page mounts. `cancelled` guards against calling
  // setState after unmount (React warning + memory leak).
  useEffect(() => {
    let cancelled = false;

    const loadPolls = async () => {
      try {
        const response = await api.getMyPolls();
        if (!cancelled) setPolls(response.data.polls);
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPolls();
    return () => {
      cancelled = true;
    };
  }, []);

  // Toggle a poll from draft -> published. Updates the local list optimistically
  // so the UI reflects the new state without a refetch.
  const publishPoll = async (pollId) => {
    setPublishingId(pollId);

    try {
      await api.publishPoll(pollId);
      setPolls((currentPolls) =>
        currentPolls.map((poll) =>
          poll.id === pollId ? { ...poll, isPublished: true } : poll,
        ),
      );
      toast.success("Poll published!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishingId(null);
    }
  };

  // Unpublish a poll: makes the public link stop accepting responses and also
  // hides published results (both flags are reset to false).
  const unpublishPoll = async (pollId) => {
    setUnpublishingId(pollId);

    try {
      await api.unpublishPoll(pollId);
      setPolls((currentPolls) =>
        currentPolls.map((poll) =>
          poll.id === pollId ? { ...poll, isPublished: false, resultsPublished: false } : poll,
        ),
      );
      toast.success("Poll unpublished!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnpublishingId(null);
    }
  };

  // Publish the final results so the public link shows the outcome summary.
  const publishResults = async (pollId) => {
    setPublishingResultsId(pollId);

    try {
      await api.publishResults(pollId);
      setPolls((currentPolls) =>
        currentPolls.map((poll) =>
          poll.id === pollId ? { ...poll, resultsPublished: true } : poll,
        ),
      );
      toast.success("Results published!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishingResultsId(null);
    }
  };

  // Hide the published results again (poll keeps accepting responses).
  const unpublishResults = async (pollId) => {
    setUnpublishingResultsId(pollId);

    try {
      await api.unpublishResults(pollId);
      setPolls((currentPolls) =>
        currentPolls.map((poll) =>
          poll.id === pollId ? { ...poll, resultsPublished: false } : poll,
        ),
      );
      toast.success("Results unpublished!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnpublishingResultsId(null);
    }
  };

  // Share the public poll URL: uses the native share sheet on mobile where
  // available, otherwise falls back to copying the link to the clipboard.
  const sharePoll = async (poll) => {
    const publicUrl = `${window.location.origin}/p/${poll.slug}`;
    setSharingId(poll.id);

    try {
      if (navigator.share) {
        await navigator.share({ title: poll.title, url: publicUrl });
      } else {
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      // Closing the native share sheet is not an error.
      if (err?.name !== "AbortError") toast.error("Unable to share the poll link");
    } finally {
      setSharingId(null);
    }
  };

  // Delete a poll after a confirmation dialog; removes it from the local list.
  const deletePoll = async (poll) => {
    if (!window.confirm(`Delete "${poll.title}"? This cannot be undone.`)) return;

    setDeletingId(poll.id);

    try {
      await api.deletePoll(poll.id);
      setPolls((currentPolls) =>
        currentPolls.filter((item) => item.id !== poll.id),
      );
      toast.success("Poll deleted.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
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
        </div>
      </div>

      {/* Summary stats computed from the loaded polls. */}
      <div className="stat-grid" aria-label="Poll overview">
        <div className="stat-card"><span className="stat-label">Polls in space</span><strong className="stat-value">{polls.length}</strong></div>
        <div className="stat-card"><span className="stat-label">Live now</span><strong className="stat-value success">{polls.filter((poll) => poll.isPublished).length}</strong></div>
        <div className="stat-card"><span className="stat-label">Responses</span><strong className="stat-value">{polls.reduce((total, poll) => total + (poll.totalResponses || 0), 0)}</strong></div>
        <div className="stat-card"><span className="stat-label">Mode</span><strong className="stat-value accent">Live</strong></div>
      </div>

      {loading ? (
        <div className="poll-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="poll-card">
              <div className="card-heading">
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-6 w-3/4 max-w-sm mb-3" />
                  <Skeleton className="h-4 w-1/4 max-w-xs" />
                </div>
                <div className="poll-meta" style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" style={{ borderRadius: "999px" }} />
                </div>
              </div>
              <div className="card-actions" style={{ marginTop: "24px" }}>
                <Skeleton className="h-11 w-24" style={{ borderRadius: "12px" }} />
                <Skeleton className="h-11 w-32" style={{ borderRadius: "12px" }} />
                <Skeleton className="h-11 w-32" style={{ borderRadius: "12px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && polls.length > 0 ? (
        <div className="poll-list">
          {polls.map((poll) => (
            <article key={poll.id} className="poll-card">
              {/* Header: poll title/slug and response count + publish status. */}
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
                {!poll.isPublished ? (
                  <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/edit`}>Edit poll</Link>
                ) : null}
                <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/analytics`}>View analytics</Link>
                <button className="btn btn-secondary" type="button" disabled={sharingId === poll.id} onClick={() => void sharePoll(poll)}>
                  {sharingId === poll.id ? "Sharing…" : "Share poll"}
                </button>
                <Link className="btn btn-quiet" to={`/p/${poll.slug}`} target="_blank" rel="noreferrer">Open public link</Link>
                {!poll.isPublished ? (
                  <button className="btn btn-primary" type="button" disabled={publishingId === poll.id} onClick={() => void publishPoll(poll.id)}>
                    {publishingId === poll.id ? "Publishing…" : "Publish poll"}
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" type="button" disabled={unpublishingId === poll.id} onClick={() => void unpublishPoll(poll.id)}>
                      {unpublishingId === poll.id ? "Unpublishing…" : "Unpublish poll"}
                    </button>
                    {!poll.resultsPublished ? (
                      <button className="btn btn-primary" type="button" disabled={publishingResultsId === poll.id} onClick={() => void publishResults(poll.id)}>
                        {publishingResultsId === poll.id ? "Publishing results…" : "Publish results"}
                      </button>
                    ) : (
                      <button className="btn btn-secondary" type="button" disabled={unpublishingResultsId === poll.id} onClick={() => void unpublishResults(poll.id)}>
                        {unpublishingResultsId === poll.id ? "Unpublishing results…" : "Unpublish results"}
                      </button>
                    )}
                  </>
                )}
                <button className="btn btn-secondary btn-danger" type="button" disabled={deletingId === poll.id} onClick={() => void deletePoll(poll)}>
                  {deletingId === poll.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && polls.length === 0 ? <div className="empty-state"><strong>Your first signal starts here.</strong>Create a poll to begin collecting responses.</div> : null}
    </AppShell>
  );
}
