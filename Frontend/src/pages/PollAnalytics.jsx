// Analytics page (route "/dashboard/polls/:pollId/analytics") for a poll
// owner. Shows response counts, per-question option breakdowns, participation
// insights, and a "Publish Final Results" button. Data refreshes live over
// WebSocket whenever a new response arrives.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";
import AppShell from "../Components/AppShell.jsx";

export default function PollAnalytics() {
  const { pollId } = useParams();
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [error, setError] = useState("");
  const loadAllRef = useRef(() => {});

  // Fetch all three analytics endpoints in parallel.
  const fetchAll = useCallback(async () => {
    const [summaryRes, questionsRes, participationRes] = await Promise.all([
      api.analyticsSummary(pollId),
      api.analyticsQuestions(pollId),
      api.analyticsParticipation(pollId),
    ]);

    return {
      summary: summaryRes.data,
      questions: questionsRes.data.questionWise || [],
      participation: participationRes.data.insights || [],
    };
  }, [pollId]);

  const applyAnalytics = (data) => {
    setSummary(data.summary);
    setQuestions(data.questions);
    setParticipation(data.participation);
  };

  const loadAll = useCallback(async () => {
    try {
      applyAnalytics(await fetchAll());
    } catch (err) {
      setError(err.message);
    }
  }, [fetchAll]);

  useEffect(() => {
    loadAllRef.current = loadAll;
  }, [loadAll]);

  // Initial load when the page or pollId changes.
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await fetchAll();
        if (!cancelled) applyAnalytics(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [fetchAll]);

  // Realtime: connect the socket, tell the backend we're the owner of this
  // poll, and re-fetch analytics whenever the backend broadcasts an update.
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join_owner", { pollId });

    const onRealtime = () => {
      void loadAllRef.current();
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
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Readout / live analytics</span>
          <h1 className="page-title">Find the shape of the answer.</h1>
          <p className="page-description">A live readout of response volume, choice patterns, and where people are choosing not to answer.</p>
        </div>
        <Link to="/dashboard" className="btn btn-quiet">Back to dashboard</Link>
      </div>

      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

      {summary && !summary.isPublished ? (
        <div className="alert" style={{ borderColor: "color-mix(in srgb, var(--app-accent) 45%, transparent)", background: "color-mix(in srgb, var(--app-accent) 9%, transparent)", color: "var(--app-accent)" }}>
          This poll is still in draft mode. Publish it from the dashboard so people can respond.
        </div>
      ) : null}

      {summary ? (
        <div className="stat-grid" aria-label="Analytics summary">
          <div className="stat-card"><span className="stat-label">Total responses</span><strong className="stat-value">{summary.totalResponses}</strong></div>
          <div className="stat-card"><span className="stat-label">Anonymous</span><strong className="stat-value">{summary.participantBreakdown.anonymous}</strong></div>
          <div className="stat-card"><span className="stat-label">Authenticated</span><strong className="stat-value">{summary.participantBreakdown.authenticated}</strong></div>
          <div className="stat-card"><span className="stat-label">Publication</span><strong className={`stat-value ${summary.isPublished ? "success" : "accent"}`}>{summary.isPublished ? "Live" : "Draft"}</strong></div>
        </div>
      ) : <div className="panel muted">Loading analytics…</div>}

      <div className="analytics-stack">
        <section className="panel" aria-labelledby="question-counts-heading">
          <div className="panel-heading">
            <div><span className="eyebrow">Response pattern</span><h2 id="question-counts-heading" className="panel-title">Question-wise option counts</h2></div>
            <span className="meta-label">Updates live</span>
          </div>
          {questions.length === 0 ? <p className="panel-copy">No response data yet. Your first answer will appear here.</p> : null}
          {questions.map((q) => {
            const totalVotes = q.options.reduce((total, option) => total + option.count, 0);
            return (
              <div key={q.questionId} className="analytics-question">
                <p className="card-title">{q.text}</p>
                <div style={{ marginTop: "16px" }}>
                  {q.options.map((opt) => {
                    const percentage = totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0;
                    return (
                      <div key={opt.optionId} className="result-row">
                        <span>{opt.text}</span>
                        <div className="result-track" aria-hidden="true"><div className="result-fill" style={{ width: `${percentage}%` }} /></div>
                        <span className="result-value">{opt.count} · {percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel" aria-labelledby="participation-heading">
          <div className="panel-heading">
            <div><span className="eyebrow">Participation</span><h2 id="participation-heading" className="panel-title">Where attention drops</h2></div>
          </div>
          {participation.length === 0 ? <p className="panel-copy">Participation insights will appear after responses come in.</p> : null}
          {participation.map((item) => (
            <div key={item.questionId} className="analytics-question">
              <div className="panel-heading">
                <span className="panel-copy">{item.text}</span>
                <span className="result-value">Answered {item.answeredCount} · Skipped {item.skipCount}</span>
              </div>
            </div>
          ))}
        </section>
      </div>

      {!summary?.isPublished ? <button className="btn btn-primary" onClick={publish} style={{ marginTop: "18px" }}>Publish poll</button> : null}
    </AppShell>
  );
}
