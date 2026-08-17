// Empty state messages for the dashboard: one for when filters match nothing,
// and one for brand-new users with no polls at all.
import { Link } from "react-router-dom";

export function FilteredEmptyState({ onClearFilters }) {
  return (
    <div className="empty-state">
      <strong>No matching polls found</strong>
      <p className="text-sm text-[var(--app-muted)] mt-1 mb-4">
        We couldn't find any polls matching your active filters and search query.
      </p>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClearFilters}
      >
        Clear filters
      </button>
    </div>
  );
}

export function FirstPollEmptyState() {
  return (
    <div className="empty-state">
      <strong>Your first signal starts here.</strong>
      <p className="text-sm text-[var(--app-muted)] mt-1 mb-4">
        Create a poll to begin collecting responses and analyzing insights in real-time.
      </p>
      <Link className="btn btn-primary" to="/dashboard/polls/new">
        Create your first poll
      </Link>
    </div>
  );
}
