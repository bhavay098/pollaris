// Custom hook encapsulating poll action handlers (publish, unpublish, share,
// delete, etc.) and their per-poll busy flags.
import { useState } from "react";
import api from "../lib/api";
import { toast } from "sonner";

export default function usePollActions(triggerRefresh) {
  const [publishingId, setPublishingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [publishingResultsId, setPublishingResultsId] = useState(null);
  const [unpublishingResultsId, setUnpublishingResultsId] = useState(null);
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

  const deletePoll = async (pollId) => {
    setDeletingId(pollId);
    try {
      await api.deletePoll(pollId);
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
    deletingId,
    publishPoll,
    unpublishPoll,
    publishResults,
    unpublishResults,
    deletePoll,
  };
}
