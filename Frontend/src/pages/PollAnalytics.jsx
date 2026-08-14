// Analytics page (route "/dashboard/polls/:pollId/analytics") for a poll
// owner. Shows response counts, per-question option breakdowns, participation
// insights, and a "Publish Final Results" button. Data refreshes live over
// WebSocket whenever a new response arrives.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";

export default function PollAnalytics() {
  const { pollId } = useParams();
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [error, setError] = useState("");

  // Fetch all three analytics endpoints in parallel and store the results.
  const loadAll = async () => {
    try {
      const [summaryRes, questionsRes, participationRes] = await Promise.all([
        api.analyticsSummary(pollId),
        api.analyticsQuestions(pollId),
        api.analyticsParticipation(pollId),
      ]);
      setSummary(summaryRes.data);
      setQuestions(questionsRes.data.questionWise || []);
      setParticipation(participationRes.data.insights || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // Initial load when the page or pollId changes.
  useEffect(() => {
    loadAll();
  }, [pollId]);

  // Realtime: connect the socket, tell the backend we're the owner of this
  // poll, and re-fetch analytics whenever the backend broadcasts an update.
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join_owner", { pollId });

    const onRealtime = () => {
      loadAll();
    };

    socket.on("analytics:response_received", onRealtime);
    socket.on("analytics:question_updated", onRealtime);
    socket.on("poll:status_changed", onRealtime);

    // Cleanup: stop listening and close the socket when leaving the page.
    return () => {
      socket.off("analytics:response_received", onRealtime);
      socket.off("analytics:question_updated", onRealtime);
      socket.off("poll:status_changed", onRealtime);
      socket.disconnect();
    };
  }, [pollId]);

  // Make the results public/shared (publish final results), then refresh.
  const publish = async () => {
    try {
      await api.publishPoll(pollId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Poll Analytics</h1>
          <Link to="/dashboard" className="text-teal-400">
            Back
          </Link>
        </div>

        {error ? <p className="text-red-400">{error}</p> : null}

        {summary ? (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">Total Responses</p>
              <p className="text-2xl font-bold">{summary.totalResponses}</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">Anonymous</p>
              <p className="text-2xl font-bold">
                {summary.participantBreakdown.anonymous}
              </p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">Authenticated</p>
              <p className="text-2xl font-bold">
                {summary.participantBreakdown.authenticated}
              </p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-400 text-sm">Published</p>
              <p className="text-2xl font-bold">
                {summary.isPublished ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ) : (
          <p>Loading analytics...</p>
        )}

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Question-wise Option Counts
            </h2>
          </div>
          {questions.map((q) => (
            <div
              key={q.questionId}
              className="border border-zinc-800 rounded-xl p-3"
            >
              <p className="font-medium">{q.text}</p>
              <div className="mt-2 space-y-1 text-sm text-zinc-300">
                {q.options.map((opt) => (
                  <div key={opt.optionId} className="flex justify-between">
                    <span>{opt.text}</span>
                    <span>{opt.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
          <h2 className="text-xl font-semibold">Participation Insights</h2>
          {participation.map((item) => (
            <div
              key={item.questionId}
              className="flex justify-between text-sm border-b border-zinc-800 py-2"
            >
              <span>{item.text}</span>
              <span>
                Answered: {item.answeredCount} | Skipped: {item.skipCount}
              </span>
            </div>
          ))}
        </div>

        {!summary?.isPublished ? (
          <button
            className="bg-teal-500 hover:bg-teal-600 rounded-xl px-4 py-3 font-semibold"
            onClick={publish}
          >
            Publish Final Results
          </button>
        ) : null}
      </div>
    </div>
  );
}
