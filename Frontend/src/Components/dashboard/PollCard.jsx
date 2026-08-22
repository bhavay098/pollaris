import { Link, useNavigate } from "react-router-dom";
import DropdownMenu, { DropdownItem, DropdownDivider } from "../ui/DropdownMenu.jsx";
import {
  BarChart2,
  Share2,
  MoreVertical,
  Globe,
  Lock,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileEdit,
} from "lucide-react";

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
  const navigate = useNavigate();

  const getStatusLabel = () => {
    if (poll.isExpired) return "Expired";
    if (poll.isPublished) return "Live";
    return "Draft";
  };

  const getStatusClass = () => {
    if (poll.isExpired) return "expired";
    if (poll.isPublished) return "live";
    return "draft";
  };

  return (
    <article
      className="poll-card group cursor-pointer hover:border-[var(--app-border-strong)]"
      onClick={(e) => {
        // Prevent navigating if clicking an action button or dropdown
        if (e.target.closest("button") || e.target.closest("a") || e.target.closest("[role='menu']")) {
          return;
        }
        navigate(`/dashboard/polls/${poll.id}/analytics`);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`status-chip ${getStatusClass()}`}>
              {getStatusLabel()}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_60%,transparent)] text-[10px] font-medium text-[var(--app-subtle)]">
              {poll.responseMode === "AUTHENTICATED" ? (
                <>
                  <Lock className="h-3 w-3 text-amber-400" />
                  <span>Authenticated</span>
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3 text-teal-400" />
                  <span>Public</span>
                </>
              )}
            </span>
            {poll.resultsPublished && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-semibold">
                <Eye className="h-3 w-3" />
                <span>Results Public</span>
              </span>
            )}
          </div>

          <h2 className="poll-card-title text-lg sm:text-xl font-bold tracking-tight text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition-colors">
            {poll.title}
          </h2>

          <p className="text-xs text-[var(--app-muted)] line-clamp-1">
            {poll.description || `/${poll.slug}`}
          </p>
        </div>

        {/* Right meta badge */}
        <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] text-xs font-bold text-[var(--app-text)]">
            <BarChart2 className="h-3.5 w-3.5 text-[var(--app-primary)]" />
            <span>
              {poll.totalResponses}{" "}
              <span className="font-normal text-[var(--app-muted)] text-[11px]">
                {poll.totalResponses === 1 ? "response" : "responses"}
              </span>
            </span>
          </div>
          {poll.expiresAt && (
            <span className="text-[10px] text-[var(--app-subtle)] inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{poll.isExpired ? "Closed" : `Expires ${new Date(poll.expiresAt).toLocaleDateString()}`}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-5 pt-4 border-t border-[var(--app-border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Primary View Analytics / Edit button */}
          <Link
            to={`/dashboard/polls/${poll.id}/analytics`}
            className="btn btn-secondary text-xs py-1.5 px-3.5 min-h-[38px] gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <BarChart2 className="h-3.5 w-3.5 text-[var(--app-primary)]" />
            <span>View Analytics</span>
          </Link>

          {/* Quick Share button */}
          <button
            type="button"
            className="btn btn-quiet text-xs py-1.5 px-3 min-h-[38px] gap-1.5"
            disabled={sharingId === poll.id}
            onClick={(e) => {
              e.stopPropagation();
              onShare(poll);
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>

          {/* Direct Public Link */}
          <a
            href={`/p/${poll.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex btn btn-quiet text-xs py-1.5 px-3 min-h-[38px] gap-1.5"
            onClick={(e) => e.stopPropagation()}
            title="Open public page in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Link</span>
          </a>
        </div>

        {/* 3-Dot Action Dropdown for secondary management actions */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-raised)] transition-colors"
                aria-label="More poll actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
            align="right"
          >
            {/* Edit poll (if draft) */}
            {!poll.isPublished && (
              <DropdownItem as={Link} to={`/dashboard/polls/${poll.id}/edit`}>
                <FileEdit className="h-4 w-4 text-[var(--app-muted)]" />
                <span>Edit Poll</span>
              </DropdownItem>
            )}

            {/* Share action */}
            <DropdownItem onClick={() => onShare(poll)}>
              <Share2 className="h-4 w-4 text-[var(--app-muted)]" />
              <span>Share & Copy Link</span>
            </DropdownItem>

            {/* Open in new tab */}
            <DropdownItem as="a" href={`/p/${poll.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 text-[var(--app-muted)]" />
              <span>Open Public Page</span>
            </DropdownItem>

            <DropdownDivider />

            {/* Publish / Unpublish poll */}
            {!poll.isPublished ? (
              <DropdownItem
                disabled={publishingId === poll.id || poll.isExpired}
                onClick={() => onPublish(poll.id)}
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--app-primary)]" />
                <span>{publishingId === poll.id ? "Publishing…" : "Publish Poll"}</span>
              </DropdownItem>
            ) : (
              <DropdownItem
                disabled={unpublishingId === poll.id}
                onClick={() => onUnpublish(poll.id)}
              >
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>{unpublishingId === poll.id ? "Unpublishing…" : "Unpublish Poll"}</span>
              </DropdownItem>
            )}

            {/* Publish / Unpublish results (only if poll is published) */}
            {poll.isPublished && (
              !poll.resultsPublished ? (
                <DropdownItem
                  disabled={publishingResultsId === poll.id}
                  onClick={() => onPublishResults(poll.id)}
                >
                  <Eye className="h-4 w-4 text-teal-400" />
                  <span>{publishingResultsId === poll.id ? "Releasing…" : "Publish Results"}</span>
                </DropdownItem>
              ) : (
                <DropdownItem
                  disabled={unpublishingResultsId === poll.id}
                  onClick={() => onUnpublishResults(poll.id)}
                >
                  <EyeOff className="h-4 w-4 text-[var(--app-subtle)]" />
                  <span>{unpublishingResultsId === poll.id ? "Hiding…" : "Hide Results"}</span>
                </DropdownItem>
              )
            )}

            <DropdownDivider />

            {/* Delete poll */}
            <DropdownItem
              variant="danger"
              disabled={deletingId === poll.id}
              onClick={() => onDelete(poll)}
            >
              <Trash2 className="h-4 w-4" />
              <span>{deletingId === poll.id ? "Deleting…" : "Delete Poll"}</span>
            </DropdownItem>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
