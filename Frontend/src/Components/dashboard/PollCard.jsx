// Individual poll card component for the dashboard.
import { Link } from "react-router-dom";

export default function PollCard({
  poll,
  publishingId,
  unpublishingId,
  publishingResultsId,
  unpublishingResultsId,
  sharingId,
  deletingId,
  onPublish,
  onUnpublish,
  onPublishResults,
  onUnpublishResults,
  onShare,
  onDelete,
}) {
  const getStatusLabel = () => {
    if (poll.isExpired) return "Expired";
    if (poll.isPublished) return "Published";
    return "Draft";
  };

  const getStatusClass = () => {
    if (poll.isExpired) return "expired";
    if (poll.isPublished) return "live";
    return "draft";
  };

  return (
    <article className="poll-card">
      <div className="card-heading">
        <div>
          <h2 className="poll-card-title">{poll.title}</h2>
          <p className="poll-slug">{poll.description || `/${poll.slug}`}</p>
        </div>
        <div className="poll-meta">
          <span>{poll.totalResponses} {poll.totalResponses === 1 ? "response" : "responses"}</span>
          <span className={`status-chip ${getStatusClass()}`}>{getStatusLabel()}</span>
        </div>
      </div>

      <div className="card-actions" style={{ marginTop: "20px" }}>
        {!poll.isPublished ? (
          <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/edit`}>
            Edit poll
          </Link>
        ) : null}

        <Link className="btn btn-secondary" to={`/dashboard/polls/${poll.id}/analytics`}>
          View analytics
        </Link>

        <button
          className="btn btn-secondary"
          type="button"
          disabled={sharingId === poll.id}
          onClick={() => onShare(poll)}
        >
          {sharingId === poll.id ? "Sharing…" : "Share poll"}
        </button>

        <Link className="btn btn-quiet" to={`/p/${poll.slug}`} target="_blank" rel="noreferrer">
          Open public link
        </Link>

        {!poll.isPublished ? (
          <button
            className="btn btn-primary"
            type="button"
            disabled={publishingId === poll.id || poll.isExpired}
            onClick={() => onPublish(poll.id)}
          >
            {publishingId === poll.id ? "Publishing…" : "Publish poll"}
          </button>
        ) : (
          <>
            <button
              className="btn btn-secondary"
              type="button"
              disabled={unpublishingId === poll.id}
              onClick={() => onUnpublish(poll.id)}
            >
              {unpublishingId === poll.id ? "Unpublishing…" : "Unpublish poll"}
            </button>
            {!poll.resultsPublished ? (
              <button
                className="btn btn-primary"
                type="button"
                disabled={publishingResultsId === poll.id}
                onClick={() => onPublishResults(poll.id)}
              >
                {publishingResultsId === poll.id ? "Publishing results…" : "Publish results"}
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                type="button"
                disabled={unpublishingResultsId === poll.id}
                onClick={() => onUnpublishResults(poll.id)}
              >
                {unpublishingResultsId === poll.id ? "Unpublishing results…" : "Unpublish results"}
              </button>
            )}
          </>
        )}

        <button
          className="btn btn-secondary btn-danger"
          type="button"
          disabled={deletingId === poll.id}
          onClick={() => onDelete(poll)}
        >
          {deletingId === poll.id ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
