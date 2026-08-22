// Authenticated dashboard (route "/dashboard"): lists the current user's polls
// with search, status filtering, sorting, pagination, and quick action controls.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";
import DashboardStats from "../Components/dashboard/DashboardStats.jsx";
import DashboardToolbar from "../Components/dashboard/DashboardToolbar.jsx";
import DashboardSkeleton from "../Components/dashboard/DashboardSkeleton.jsx";
import { FilteredEmptyState, FirstPollEmptyState } from "../Components/dashboard/DashboardEmptyStates.jsx";
import PollCard from "../Components/dashboard/PollCard.jsx";
import SharePollModal from "../Components/dashboard/SharePollModal.jsx";
import ConfirmModal from "../Components/common/ConfirmModal.jsx";
import Pagination from "../Components/ui/Pagination.jsx";
import usePollActions from "../hooks/usePollActions.js";
import { Plus } from "lucide-react";

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

  // Modals state
  const [sharingPoll, setSharingPoll] = useState(null);
  const [deletingPoll, setDeletingPoll] = useState(null);

  const { user } = useAuthStore();

  // Incrementing refreshKey triggers a background refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // Poll action handlers (publish, share, delete, etc.) and per-poll busy flags
  const actions = usePollActions(triggerRefresh);

  // Debounce search query to prevent spamming backend on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchPolls = useCallback(async () => {
    try {
      const response = await api.getMyPolls({
        search: debouncedSearch,
        status,
        sort,
        page,
        limit: 6,
      });
      return response.data;
    } catch (err) {
      toast.error(err.message || "Failed to load polls");
      return null;
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, sort, page]);

  // Fetch polls matching current query parameters
  useEffect(() => {
    let cancelled = false;

    void fetchPolls().then((data) => {
      if (!cancelled && data) {
        setPolls(data.polls || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fetchPolls, refreshKey]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setLoading(true);
  };

  const handleStatusChange = (newStatus) => {
    setLoading(true);
    setStatus(newStatus);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setLoading(true);
    setSort(newSort);
    setPage(1);
  };

  const clearAllFilters = () => {
    setLoading(true);
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setSort("newest");
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPoll) return;
    await actions.deletePoll(deletingPoll.id);
    setDeletingPoll(null);
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
          <Link className="btn btn-primary gap-2" to="/dashboard/polls/new">
            <Plus className="h-4 w-4" />
            <span>Create Poll</span>
          </Link>
        </div>
      </div>

      {/* Summary stats computed across all user polls (interactive filter) */}
      <DashboardStats
        stats={stats}
        activeStatus={status}
        onStatusChange={handleStatusChange}
      />

      {/* Search, Filter & Sort Toolbar */}
      <DashboardToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSortChange}
        stats={stats}
      />

      {/* Loading Skeletons */}
      {loading ? <DashboardSkeleton /> : null}

      {/* Poll Cards List */}
      {!loading && polls.length > 0 ? (
        <>
          <div className="poll-list">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                publishingId={actions.publishingId}
                unpublishingId={actions.unpublishingId}
                publishingResultsId={actions.publishingResultsId}
                unpublishingResultsId={actions.unpublishingResultsId}
                sharingId={actions.sharingId}
                deletingId={actions.deletingId}
                onPublish={actions.publishPoll}
                onUnpublish={actions.unpublishPoll}
                onPublishResults={actions.publishResults}
                onUnpublishResults={actions.unpublishResults}
                onShare={(p) => setSharingPoll(p)}
                onDelete={(p) => setDeletingPoll(p)}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => {
              setLoading(true);
              setPage(newPage);
              window.scrollTo({ top: 200, behavior: "smooth" });
            }}
          />
        </>
      ) : null}

      {/* Empty States */}
      {!loading && polls.length === 0 ? (
        isFiltered ? (
          <FilteredEmptyState onClearFilters={clearAllFilters} />
        ) : (
          <FirstPollEmptyState />
        )
      ) : null}

      {/* Share Poll Modal */}
      <SharePollModal
        isOpen={Boolean(sharingPoll)}
        onClose={() => setSharingPoll(null)}
        poll={sharingPoll}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPoll)}
        onClose={() => setDeletingPoll(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deletingPoll?.title}"?`}
        description="All recorded responses and analytics for this poll will be permanently deleted. This action cannot be undone."
        confirmText="Delete Poll"
        isLoading={Boolean(actions.deletingId)}
      />
    </AppShell>
  );
}
