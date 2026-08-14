// Public poll page (route "/p/:slug"). This is the shareable link anyone can
// open: visitors answer the questions, and if the owner has published final
// results they see the results instead. Realtime via WebSocket.
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";
import { useAuthStore } from "../store/auth-store";

export default function PublicPoll() {
  const { slug } = useParams();
  // Needed to enforce "authenticated responses only" polls below.
  const { user } = useAuthStore();
  const [poll, setPoll] = useState(null);
  // answers maps questionId -> selected optionId as the visitor fills the form.
  const [answers, setAnswers] = useState({});
  // submitted/message/error tracks the form submission result.
  const [status, setStatus] = useState({ submitted: false, message: "", error: "" });
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  // True once the poll's expiry date has passed (disables submitting).
  const isExpired = useMemo(() => {
    if (!poll?.expiresAt) return false;
    return new Date() > new Date(poll.expiresAt);
  }, [poll]);

  // Fetch the poll by slug; if it's published, also pull its results.
  const loadPoll = async () => {
    try {
      const response = await api.getPublicPoll(slug);
      setPoll(response.data.poll);
      if (response.data.poll.isPublished) {
        const resultRes = await api.getPublicResults(slug);
        setResults(resultRes.data);
      }
    } catch (err) {
      setStatus((prev) => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, [slug]);

  // Realtime: join the public room for this poll. When new responses arrive
  // (and results are published) refresh the numbers; when the owner publishes
  // results, re-fetch the poll so this page switches to the results view.
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join_public", { slug });

    const onRealtime = async () => {
      if (poll?.isPublished) {
        const resultRes = await api.getPublicResults(slug);
        setResults(resultRes.data);
      }
    };

    socket.on("analytics:response_received", onRealtime);
    socket.on("analytics:question_updated", onRealtime);
    socket.on("poll:status_changed", async () => {
      await loadPoll();
    });

    // Cleanup on unmount: remove listeners and close the socket.
    return () => {
      socket.off("analytics:response_received", onRealtime);
      socket.off("analytics:question_updated", onRealtime);
      socket.off("poll:status_changed");
      socket.disconnect();
    };
  }, [slug, poll?.isPublished]);

  // Convert the answers map {questionId: optionId} into the array shape the
  // backend expects, then POST it.
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ submitted: false, message: "", error: "" });

    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };
      await api.submitPublicResponse(slug, payload);
      setStatus({ submitted: true, message: "Response submitted successfully", error: "" });
    } catch (err) {
      setStatus({ submitted: false, message: "", error: err.message });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-white p-6">Loading poll...</div>;
  }

  if (status.error && !poll) {
    return <div className="min-h-screen bg-zinc-950 text-red-400 p-6">{status.error}</div>;
  }

  // Published results view: no form, just the final numbers.
  if (poll?.isPublished && results) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold">{results.poll.title} (Published Results)</h1>
          <p className="text-zinc-400">Total responses: {results.totalResponses}</p>
          {results.questionWise.map((q) => (
            <div key={q.questionId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h2 className="font-semibold">{q.text}</h2>
              <div className="space-y-1 mt-2 text-sm text-zinc-300">
                {q.options.map((opt) => (
                  <div key={opt.optionId} className="flex justify-between">
                    <span>{opt.text}</span>
                    <span>{opt.count} ({opt.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Auth-gated poll: logged-out visitors get a "login required" screen.
  if (poll.responseMode === "AUTHENTICATED" && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="text-zinc-300">This poll accepts authenticated responses only.</p>
          <Link className="text-teal-400" to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <form onSubmit={submit} className="max-w-4xl mx-auto space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-3xl font-bold">{poll.title}</h1>
          <p className="text-zinc-300 mt-2">{poll.description}</p>
          <p className="text-sm text-zinc-400 mt-2">Expires: {new Date(poll.expiresAt).toLocaleString()}</p>
        </div>

        {/* One radio group per question; the required questions are marked * */}
        {poll.questions.map((question) => (
          <div key={question.questionId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h2 className="font-semibold">{question.text} {question.isRequired ? <span className="text-red-400">*</span> : null}</h2>
            <div className="mt-2 space-y-2">
              {question.options.map((option) => (
                <label key={option.optionId} className="flex gap-2 text-zinc-300">
                  <input
                    type="radio"
                    name={question.questionId}
                    value={option.optionId}
                    checked={answers[question.questionId] === option.optionId}
                    onChange={() => setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId }))}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}

        {status.error ? <p className="text-red-400">{status.error}</p> : null}
        {status.submitted ? <p className="text-green-400">{status.message}</p> : null}

        <button disabled={isExpired} className="bg-teal-500 disabled:bg-zinc-700 px-5 py-3 rounded-xl font-semibold">
          {isExpired ? "Poll Expired" : "Submit Response"}
        </button>
      </form>
    </div>
  );
}
