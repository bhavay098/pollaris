// Toolbar for searching, filtering by status, and sorting polls on the dashboard.

export default function DashboardToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  stats,
}) {
  const filterOptions = [
    { key: "all", label: "All", count: stats?.total ?? 0 },
    { key: "active", label: "Live", count: stats?.active ?? 0 },
    { key: "draft", label: "Drafts", count: stats?.draft ?? 0 },
    { key: "expired", label: "Expired", count: stats?.expired ?? 0 },
  ];

  return (
    <div className="dashboard-toolbar">
      {/* Search Input */}
      <div className="toolbar-search-wrapper">
        <div className="toolbar-search">
          <svg
            className="search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search polls by title…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search polls by title"
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search query"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Sort Selection */}
      <div className="toolbar-actions">
        {/* Status Filter Chips */}
        <div className="status-filters" role="tablist" aria-label="Filter polls by status">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="tab"
              aria-selected={status === opt.key}
              className={`filter-chip ${status === opt.key ? "active" : ""}`}
              onClick={() => onStatusChange(opt.key)}
            >
              <span>{opt.label}</span>
              <span className="filter-count">{opt.count}</span>
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="sort-selector-wrapper">
          <label htmlFor="poll-sort" className="sr-only">
            Sort polls
          </label>
          <select
            id="poll-sort"
            className="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most_votes">Most responses</option>
            <option value="least_votes">Least responses</option>
          </select>
          <svg
            className="sort-chevron"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
