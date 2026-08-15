// Public poll page (route "/p/:slug"). This is the shareable link anyone can
// open: visitors answer the questions, and if the owner has published final
// results they see the results instead. Realtime via WebSocket.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";

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
  const loadPoll = useCallback(async () => {
    try {
      const response = await api.getPublicPoll(slug);
      if (response.data.poll.isPublished) {
        const resultRes = await api.getPublicResults(slug);
        setResults(resultRes.data);
      } else {
        setResults(null);
      }
      setPoll(response.data.poll);
    } catch (err) {
      setPoll(null);
      setResults(null);
      setStatus((prev) => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    void loadPoll();
  }, [loadPoll]);

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
    const onStatusChanged = () => {
      void loadPoll();
    };
    socket.on("poll:status_changed", onStatusChanged);

    // Cleanup on unmount: remove listeners and close the socket.
    return () => {
      socket.off("analytics:response_received", onRealtime);
      socket.off("analytics:question_updated", onRealtime);
      socket.off("poll:status_changed", onStatusChanged);
      socket.disconnect();
    };
  }, [loadPoll, poll?.isPublished, slug]);

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
    return <AppShell><div className="panel muted">Loading poll...</div></AppShell>;
  }

  if (status.error && !poll) {
    return <AppShell><div className="alert alert-error" role="alert">{status.error}</div></AppShell>;
  }

  // Published results view: no form, just the final numbers.
  if (poll?.isPublished && results) {
    return (
      <AppShell>
        <section className="public-hero">
          <span className="eyebrow">Published readout</span>
          <h1 className="page-title">{results.poll.title}</h1>
          <div className="public-meta"><span>{results.totalResponses} total responses</span><span>Results are now public</span></div>
        </section>
        <div className="analytics-stack" style={{ marginTop: "14px" }}>
          {results.questionWise.map((q) => (
            <section key={q.questionId} className="panel">
              <h2 className="panel-title">{q.text}</h2>
              <div style={{ marginTop: "18px" }}>
                {q.options.map((opt) => (
                  <div key={opt.optionId} className="result-row">
                    <span>{opt.text}</span>
                    <div className="result-track" aria-hidden="true"><div className="result-fill" style={{ width: `${opt.percentage}%` }} /></div>
                    <span className="result-value">{opt.count} · {opt.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </AppShell>
    );
  }

  // Auth-gated poll: logged-out visitors get a "login required" screen.
  if (poll.responseMode === "AUTHENTICATED" && !user) {
    return (
      <AppShell>
        <div className="auth-layout" style={{ minHeight: "calc(100dvh - 220px)", gridTemplateColumns: "1fr" }}>
          <section className="auth-card" style={{ maxWidth: "520px", margin: "auto", textAlign: "center" }}>
            <span className="eyebrow">Private response channel</span>
            <h1>Login required</h1>
            <p className="page-description" style={{ marginInline: "auto" }}>This poll accepts authenticated responses only. Sign in to share your answer.</p>
            <Link className="btn btn-primary" to="/login" style={{ marginTop: "22px" }}>Go to login</Link>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={submit} className="builder-grid">
        <section className="public-hero">
          <span className="eyebrow">Open response channel</span>
          <h1 className="page-title">{poll.title}</h1>
          <p className="page-description">{poll.description}</p>
          <div className="public-meta"><span>Closes {new Date(poll.expiresAt).toLocaleString()}</span><span>{poll.responseMode === "ANONYMOUS" ? "Anonymous responses" : "Signed-in responses"}</span></div>
        </section>

        {poll.questions.map((question, questionIndex) => (
          <section key={question.questionId} className="question-card">
            <div className="card-heading">
              <div><span className="eyebrow">Question {String(questionIndex + 1).padStart(2, "0")}</span><h2 className="card-title">{question.text}</h2></div>
              {question.isRequired ? <span className="status-chip live">Required</span> : <span className="status-chip">Optional</span>}
            </div>
            <div className="choice-list">
              {question.options.map((option) => (
                <label key={option.optionId} className="choice-row">
                  <input type="radio" name={question.questionId} value={option.optionId} checked={answers[question.questionId] === option.optionId} onChange={() => setAnswers((prev) => ({ ...prev, [question.questionId]: option.optionId }))} />
                  {option.text}
                </label>
              ))}
            </div>
          </section>
        ))}

        {status.error ? <p className="alert alert-error" role="alert">{status.error}</p> : null}
        {status.submitted ? <p className="alert alert-success" role="status">{status.message}</p> : null}
        <button type="submit" disabled={isExpired} className="btn btn-primary">{isExpired ? "Poll expired" : "Submit response"}</button>
      </form>
    </AppShell>
  );
}
