// Reusable pagination bar with Previous/Next controls and page numbers.

export default function Pagination({ pagination, onPageChange }) {
  const { currentPage, totalPages, totalPolls, limit, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  // Compute 1-indexed range of items currently displayed
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalPolls);

  // Generate page numbers to show (e.g., 1, 2, 3, 4, 5 with sliding window)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="pagination-wrapper" aria-label="Polls pagination">
      <p className="pagination-info">
        Showing <span className="font-semibold text-[var(--app-text)]">{startItem}–{endItem}</span> of{" "}
        <span className="font-semibold text-[var(--app-text)]">{totalPolls}</span> polls
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary pagination-btn"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Prev</span>
        </button>

        <div className="pagination-pages">
          {pages[0] > 1 && (
            <>
              <button
                type="button"
                className={`page-number-btn ${currentPage === 1 ? "active" : ""}`}
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              {pages[0] > 2 && <span className="pagination-ellipsis">…</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`page-number-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={currentPage === p ? "page" : undefined}
            >
              {p}
            </button>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
              <button
                type="button"
                className={`page-number-btn ${currentPage === totalPages ? "active" : ""}`}
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary pagination-btn"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
