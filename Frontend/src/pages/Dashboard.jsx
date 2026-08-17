// Authenticated dashboard (route "/dashboard"): lists the current user's polls
// with search, status filtering, sorting, pagination, and quick action controls.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";
import Skeleton from "../Components/ui/Skeleton.jsx";
import DashboardToolbar from "../Components/dashboard/DashboardToolbar.jsx";
import PollCard from "../Components/dashboard/PollCard.jsx";
import Pagination from "../Components/ui/Pagination.jsx";

export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [pagination, setPagination] = useState({
    totalPolls: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    expired: 0,
    totalResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search, filter, sort & pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Track active async action per poll card
  const [publishingId, setPublishingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [publishingResultsId, setPublishingResultsId] = useState(null);
  const [unpublishingResultsId, setUnpublishingResultsId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useAuthStore();

  // Incrementing refreshKey triggers a background refetch
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search query to prevent spamming backend on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch polls matching current query parameters
  useEffect(() => {
    let cancelled = false;

    const fetchPolls = async () => {
      setLoading(true);
      try {
        const response = await api.getMyPolls({
          search: debouncedSearch,
          status,
          sort,
          page,
          limit: 6,
        });

        if (!cancelled) {
          setPolls(response.data.polls || []);
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }
          if (response.data.stats) {
            setStats(response.data.stats);
          }
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || "Failed to load polls");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchPolls();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, sort, page, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setSort("newest");
    setPage(1);
  };

  // Toggle a poll from draft -> published
  const publishPoll = async (pollId) => {
    setPublishingId(pollId);
    try {
      await api.publishPoll(pollId);
      toast.success("Poll published!");
      triggerRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishingId(null);
    }
  };

  // Unpublish a poll
  const unpublishPoll = async (pollId) => {
    setUnpublishingId(pollId);
    try {
      await api.unpublishPoll(pollId);
      toast.success("Poll unpublished!");
      triggerRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnpublishingId(null);
    }
  };

  // Publish final results
  const publishResults = async (pollId) => {
    setPublishingResultsId(pollId);
    try {
      await api.publishResults(pollId);
      toast.success("Results published!");
      triggerRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishingResultsId(null);
    }
  };

  // Hide published results
  const unpublishResults = async (pollId) => {
    setUnpublishingResultsId(pollId);
    try {
      await api.unpublishResults(pollId);
      toast.success("Results unpublished!");
      triggerRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUnpublishingResultsId(null);
    }
  };

  // Share public poll URL
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
      if (err?.name !== "AbortError") toast.error("Unable to share the poll link");
    } finally {
      setSharingId(null);
    }
  };

  // Delete a poll
  const deletePoll = async (poll) => {
    if (!window.confirm(`Delete "${poll.title}"? This cannot be undone.`)) return;
    setDeletingId(poll.id);
    try {
      await api.deletePoll(poll.id);
      toast.success("Poll deleted.");
      triggerRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const isFiltered = Boolean(debouncedSearch || status !== "all");

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Command center / overview</span>
          <h1 className="page-title">Your questions, in motion.</h1>
          <p className="page-description">
            Welcome back, {user?.name}. Keep a clear view of what is live, what is still taking shape, and where the signal is strongest.
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-primary" to="/dashboard/polls/new">Create poll</Link>
        </div>
      </div>

      {/* Summary stats computed across all user polls */}
      <div className="stat-grid" aria-label="Poll overview">
        <div className="stat-card">
          <span className="stat-label">Polls in space</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Live now</span>
          <strong className="stat-value success">{stats.active}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Responses</span>
          <strong className="stat-value">{stats.totalResponses}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Drafts</span>
          <strong className="stat-value accent">{stats.draft}</strong>
        </div>
      </div>

      {/* Search, Filter & Sort Toolbar */}
      <DashboardToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        stats={stats}
      />

      {/* Loading Skeletons */}
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

      {/* Poll Cards List */}
      {!loading && polls.length > 0 ? (
        <>
          <div className="poll-list">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                publishingId={publishingId}
                unpublishingId={unpublishingId}
                publishingResultsId={publishingResultsId}
                unpublishingResultsId={unpublishingResultsId}
                sharingId={sharingId}
                deletingId={deletingId}
                onPublish={publishPoll}
                onUnpublish={unpublishPoll}
                onPublishResults={publishResults}
                onUnpublishResults={unpublishResults}
                onShare={sharePoll}
                onDelete={deletePoll}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
          />
        </>
      ) : null}

      {/* Empty States */}
      {!loading && polls.length === 0 ? (
        isFiltered ? (
          <div className="empty-state">
            <strong>No matching polls found</strong>
            <p className="text-sm text-[var(--app-muted)] mt-1 mb-4">
              We couldn't find any polls matching your active filters and search query.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearAllFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="empty-state">
            <strong>Your first signal starts here.</strong>
            <p className="text-sm text-[var(--app-muted)] mt-1 mb-4">
              Create a poll to begin collecting responses and analyzing insights in real-time.
            </p>
            <Link className="btn btn-primary" to="/dashboard/polls/new">
              Create your first poll
            </Link>
          </div>
        )
      ) : null}
    </AppShell>
  );
}
