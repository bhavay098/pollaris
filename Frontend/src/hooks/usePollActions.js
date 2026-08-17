// Custom hook encapsulating poll action handlers (publish, unpublish, share,
// delete, etc.) and their per-poll busy flags. Extracted from Dashboard to
// keep the page component focused on layout and data fetching.
import { useState } from "react";
import api from "../../lib/api";
import { toast } from "sonner";

export default function usePollActions(triggerRefresh) {
  const [publishingId, setPublishingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [publishingResultsId, setPublishingResultsId] = useState(null);
  const [unpublishingResultsId, setUnpublishingResultsId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  return {
    publishingId,
    unpublishingId,
    publishingResultsId,
    unpublishingResultsId,
    sharingId,
    deletingId,
    publishPoll,
    unpublishPoll,
    publishResults,
    unpublishResults,
    sharePoll,
    deletePoll,
  };
}
