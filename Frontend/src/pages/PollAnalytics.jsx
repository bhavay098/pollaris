// Analytics page (route "/dashboard/polls/:pollId/analytics") for a poll
// owner. Shows response counts, per-question option breakdowns, participation
// insights, and data exports. Data refreshes live over WebSocket.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";
import Skeleton from "../Components/ui/Skeleton.jsx";
import AnalyticsExport from "../Components/analytics/AnalyticsExport.jsx";
import Tabs from "../Components/ui/Tabs.jsx";
import {
  BarChart2,
  ShieldCheck,
  Globe,
  Radio,
  Sparkles,
  Table,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

export default function PollAnalytics() {
  const { pollId } = useParams();
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participation, setParticipation] = useState([]);
  const [viewMode, setViewMode] = useState("bars"); // "bars" | "table"
  const [liveActivity, setLiveActivity] = useState(null);
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
      toast.error(err.message);
    }
  }, [fetchAll]);

  useEffect(() => {
    loadAllRef.current = loadAll;
  }, [loadAll]);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      try {
        const data = await fetchAll();
        if (!cancelled) applyAnalytics(data);
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [fetchAll]);

  // Realtime WebSocket integration
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join_owner", { pollId });

    const onRealtime = () => {
      setLiveActivity("✨ New response received just now!");
      void loadAllRef.current();
      setTimeout(() => setLiveActivity(null), 4000);
    };

    socket.on("analytics:response_received", onRealtime);
    socket.on("analytics:question_updated", onRealtime);
    socket.on("poll:status_changed", onRealtime);

    return () => {
      socket.off("analytics:response_received", onRealtime);
      socket.off("analytics:question_updated", onRealtime);
      socket.off("poll:status_changed", onRealtime);
      socket.disconnect();
    };
  }, [pollId]);

  const publish = async () => {
    try {
      await api.publishPoll(pollId);
      await loadAll();
      toast.success("Poll published successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AppShell>
      {/* Page Heading & Header Actions */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Readout / live analytics</span>
          <h1 className="page-title">Find the shape of the answer.</h1>
          <p className="page-description">
            A live readout of response volume, choice patterns, and where people are choosing not to answer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className="btn btn-quiet text-xs gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Live Socket Event Flash Alert */}
      {liveActivity && (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-semibold shadow-lg shadow-teal-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>{liveActivity}</span>
        </div>
      )}

      {/* Draft Mode Notice */}
      {summary && !summary.isPublished && (
        <div className="mb-6 alert flex items-center justify-between gap-3 border-amber-500/30 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>This poll is still in draft mode. Publish it to allow public responses.</span>
          </div>
          <button type="button" onClick={publish} className="btn btn-primary text-xs py-1.5 px-3 min-h-[32px]">
            Publish Now
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      {summary ? (
        <div className="stat-grid" aria-label="Analytics summary">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Total Responses</span>
              <BarChart2 className="h-4 w-4 text-[var(--app-primary)] opacity-80" />
            </div>
            <strong className="stat-value">{summary.totalResponses}</strong>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Anonymous</span>
              <Globe className="h-4 w-4 text-sky-400 opacity-80" />
            </div>
            <strong className="stat-value text-sky-400">{summary.participantBreakdown.anonymous}</strong>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Authenticated</span>
              <ShieldCheck className="h-4 w-4 text-indigo-400 opacity-80" />
            </div>
            <strong className="stat-value text-indigo-400">{summary.participantBreakdown.authenticated}</strong>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Publication</span>
              <Radio className="h-4 w-4 text-emerald-400 opacity-80" />
            </div>
            <strong className={`stat-value ${summary.isPublished ? "success" : "accent"}`}>
              {summary.isPublished ? "Live" : "Draft"}
            </strong>
          </div>
        </div>
      ) : (
        <div className="stat-grid" aria-label="Loading analytics summary">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <Skeleton className="h-3 w-20 mb-5" />
              <Skeleton className="h-9 w-16 mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Action Toolbar: View Mode Tabs + Export Actions */}
      <div className="my-6 flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[var(--app-border)]">
        <Tabs
          activeTab={viewMode}
          onChange={setViewMode}
          tabs={[
            { id: "bars", label: "Chart View", icon: <BarChart2 className="h-3.5 w-3.5" /> },
            { id: "table", label: "Table View", icon: <Table className="h-3.5 w-3.5" /> },
          ]}
        />

        {summary && (
          <AnalyticsExport
            summary={summary}
            questions={questions}
            participation={participation}
          />
        )}
      </div>

      {/* Main Analytics Content */}
      <div className="analytics-stack space-y-6">
        {/* Question-wise results */}
        <section className="panel" aria-labelledby="question-counts-heading">
          <div className="panel-heading pb-4 border-b border-[var(--app-border)]">
            <div>
              <span className="eyebrow text-[10px]">Response Pattern</span>
              <h2 id="question-counts-heading" className="panel-title text-lg font-bold">
                Question-wise option counts
              </h2>
            </div>
            <span className="meta-label text-[10px] inline-flex items-center gap-1.5 text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
              Updates live
            </span>
          </div>

          {!summary ? (
            <div className="mt-4 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="analytics-question">
                  <Skeleton className="h-5 w-2/3 max-w-sm mb-4" />
                  <div className="flex flex-col gap-3 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="panel-copy pt-4">No response data yet. Your first answer will appear here.</p>
          ) : null}

          {/* Render by Selected View Mode */}
          {summary && questions.map((q, qIndex) => {
            const totalVotes = q.options.reduce((total, option) => total + option.count, 0);

            if (viewMode === "table") {
              return (
                <div key={q.questionId} className="analytics-question pt-5">
                  <h3 className="card-title text-base font-bold mb-3">
                    {qIndex + 1}. {q.text}
                  </h3>
                  <div className="overflow-x-auto rounded-2xl border border-[var(--app-border)]">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--app-border)] bg-[var(--app-surface-raised)] text-[var(--app-muted)]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Option</th>
                          <th className="px-4 py-3 font-semibold text-right">Votes</th>
                          <th className="px-4 py-3 font-semibold text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--app-border)]">
                        {q.options.map((opt) => {
                          const percentage = totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0;
                          return (
                            <tr key={opt.optionId} className="hover:bg-[var(--app-surface-raised)]">
                              <td className="px-4 py-3 font-medium text-[var(--app-text)]">{opt.text}</td>
                              <td className="px-4 py-3 text-right font-mono text-[var(--app-muted)]">{opt.count}</td>
                              <td className="px-4 py-3 text-right font-bold text-[var(--app-primary)]">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            return (
              <div key={q.questionId} className="analytics-question pt-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="card-title text-base font-bold">
                    {qIndex + 1}. {q.text}
                  </h3>
                  <span className="text-xs text-[var(--app-subtle)] font-mono">
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                  </span>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt) => {
                    const percentage = totalVotes ? Math.round((opt.count / totalVotes) * 100) : 0;
                    return (
                      <div key={opt.optionId} className="result-row">
                        <span className="truncate font-medium">{opt.text}</span>
                        <div className="result-track" aria-hidden="true">
                          <div
                            className="result-fill transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="result-value font-mono">
                          {opt.count} <span className="text-[var(--app-subtle)]">({percentage}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Participation drop-off section */}
        <section className="panel" aria-labelledby="participation-heading">
          <div className="panel-heading pb-3 border-b border-[var(--app-border)]">
            <div>
              <span className="eyebrow text-[10px]">Participation</span>
              <h2 id="participation-heading" className="panel-title text-lg font-bold">
                Where attention drops
              </h2>
            </div>
          </div>

          {!summary ? (
            <div className="mt-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="analytics-question">
                  <div className="panel-heading">
                    <Skeleton className="h-4 w-1/2 max-w-xs" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : participation.length === 0 ? (
            <p className="panel-copy pt-4">Participation insights will appear after responses come in.</p>
          ) : null}

          {summary && participation.map((item, idx) => (
            <div key={item.questionId} className="analytics-question pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-[var(--app-text)]">
                  {idx + 1}. {item.text}
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400 font-medium">Answered: {item.answeredCount}</span>
                  <span className="text-[var(--app-subtle)]">•</span>
                  <span className="text-[var(--app-muted)]">Skipped: {item.skipCount}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
