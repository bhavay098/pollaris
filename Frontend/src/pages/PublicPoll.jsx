// Public poll page (route "/p/:slug").
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api";
import socket from "../lib/socket";
import { useAuthStore } from "../store/auth-store";
import AppShell from "../Components/AppShell.jsx";
import CountdownTimer from "../Components/public/CountdownTimer.jsx";
import SubmissionCelebration from "../Components/public/SubmissionCelebration.jsx";
import Skeleton from "../Components/ui/Skeleton.jsx";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Send,
  BarChart2,
} from "lucide-react";

export default function PublicPoll() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [poll, setPoll] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({ submitted: false, message: "", error: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const isExpired = useMemo(() => {
    if (!poll?.expiresAt) return false;
    return new Date() > new Date(poll.expiresAt);
  }, [poll]);

  // Fetch the poll by slug
  const loadPoll = useCallback(async () => {
    try {
      const response = await api.getPublicPoll(slug);
      if (response.data.poll.resultsPublished) {
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

  // Realtime Socket listeners
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join_public", { slug });

    const onRealtime = async () => {
      if (poll?.resultsPublished) {
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

    return () => {
      socket.off("analytics:response_received", onRealtime);
      socket.off("analytics:question_updated", onRealtime);
      socket.off("poll:status_changed", onStatusChanged);
      socket.disconnect();
    };
  }, [loadPoll, poll?.resultsPublished, slug]);

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const submitBtn = document.getElementById("submit-poll-btn");
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (isExpired || submitting) return;

    setStatus({ submitted: false, message: "", error: "" });
    setSubmitting(true);

    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };
      await api.submitPublicResponse(slug, payload);
      setStatus({ submitted: true, message: "Response submitted successfully!", error: "" });
    } catch (err) {
      setStatus({ submitted: false, message: "", error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (status.error && !poll) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto my-12 p-6 rounded-3xl border border-red-500/30 bg-red-500/10 text-red-300 text-center">
          <p className="text-sm font-semibold">{status.error}</p>
        </div>
      </AppShell>
    );
  }

  // Published results view: no form, just the final numbers.
  if (poll?.resultsPublished && results) {
    return (
      <AppShell>
        <section className="public-hero max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="eyebrow text-xs">Published Readout</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold">
              <BarChart2 className="h-3.5 w-3.5" />
              <span>Results are live & public</span>
            </span>
          </div>
          <h1 className="page-title text-2xl sm:text-4xl font-bold">{results.poll.title}</h1>
          <div className="public-meta mt-3">
            <span>{results.totalResponses} total responses</span>
          </div>
        </section>

        <div className="analytics-stack max-w-3xl mx-auto mt-6 space-y-4">
          {results.questionWise.map((q, qIndex) => (
            <section key={q.questionId} className="panel">
              <h2 className="panel-title text-base sm:text-lg font-bold">
                {qIndex + 1}. {q.text}
              </h2>
              <div className="space-y-3 mt-4">
                {q.options.map((opt) => (
                  <div key={opt.optionId} className="result-row">
                    <span className="truncate font-medium">{opt.text}</span>
                    <div className="result-track" aria-hidden="true">
                      <div className="result-fill" style={{ width: `${opt.percentage}%` }} />
                    </div>
                    <span className="result-value font-mono">
                      {opt.count} · {opt.percentage}%
                    </span>
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
    const returnUrl = `/p/${poll.slug}`;
    return (
      <AppShell>
        <div className="auth-layout" style={{ minHeight: "calc(100dvh - 220px)", gridTemplateColumns: "1fr" }}>
          <section className="auth-card max-w-md mx-auto text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Lock className="h-7 w-7" />
            </div>
            <span className="eyebrow">Private Response Channel</span>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">Sign-in Required</h1>
            <p className="text-sm text-[var(--app-muted)] leading-relaxed">
              This poll accepts authenticated responses only. Sign in to share your answer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link className="btn btn-primary text-xs py-2.5 px-5" to={`/login?redirect=${encodeURIComponent(returnUrl)}`}>
                Sign in to respond
              </Link>
              <Link className="btn btn-secondary text-xs py-2.5 px-5" to={`/register?redirect=${encodeURIComponent(returnUrl)}`}>
                Create an account
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  // Prevent creator from answering their own poll
  if (user?.id === poll.createdBy) {
    return (
      <AppShell>
        <div className="auth-layout" style={{ minHeight: "calc(100dvh - 220px)", gridTemplateColumns: "1fr" }}>
          <section className="auth-card max-w-lg mx-auto text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="eyebrow">Owner View</span>
            <h1 className="text-2xl font-bold text-[var(--app-text)]">You own this poll</h1>
            <p className="text-sm text-[var(--app-muted)] leading-relaxed">
              To ensure data integrity, creators cannot submit responses to their own polls. You can view live incoming answers on your analytics dashboard.
            </p>
            <div className="pt-2">
              <Link className="btn btn-primary text-xs py-2.5 px-6 gap-2" to={`/dashboard/polls/${poll.id}/analytics`}>
                <BarChart2 className="h-4 w-4" />
                <span>View Live Analytics</span>
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  // Post-submission celebration view
  if (status.submitted) {
    return (
      <AppShell>
        <SubmissionCelebration pollTitle={poll.title} slug={slug} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={submit} className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Public Poll Hero Header */}
        <section className="public-hero">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="eyebrow text-xs">Open Response Channel</span>
            <CountdownTimer expiresAt={poll.expiresAt} />
          </div>

          <h1 className="page-title text-2xl sm:text-3xl font-bold tracking-tight text-[var(--app-text)]">
            {poll.title}
          </h1>

          {poll.description && (
            <p className="mt-2 text-sm text-[var(--app-muted)] leading-relaxed">
              {poll.description}
            </p>
          )}

          <div className="public-meta mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-between text-xs text-[var(--app-subtle)]">
            <span className="inline-flex items-center gap-1.5">
              {poll.responseMode === "AUTHENTICATED" ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Authenticated Response</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-teal-400" />
                  <span>Anonymous Response</span>
                </>
              )}
            </span>
            <span className="text-[11px] text-[var(--app-subtle)] hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--app-surface-raised)] border border-[var(--app-border)] font-mono text-[10px]">⌘+Enter</kbd> to submit
            </span>
          </div>
        </section>

        {/* Question Cards */}
        {poll.questions.map((question, questionIndex) => (
          <section key={question.questionId} className="question-card space-y-4">
            <div className="card-heading">
              <div>
                <span className="eyebrow text-[10px]">Question {String(questionIndex + 1).padStart(2, "0")}</span>
                <h2 className="card-title text-base sm:text-lg font-bold text-[var(--app-text)]">
                  {question.text}
                </h2>
              </div>
              {question.isRequired ? (
                <span className="status-chip live text-[10px]">Required</span>
              ) : (
                <span className="status-chip text-[10px]">Optional</span>
              )}
            </div>

            <div className="choice-list space-y-2">
              {question.options.map((option, oIdx) => {
                const isSelected = answers[question.questionId] === option.optionId;
                const letter = String.fromCharCode(65 + oIdx); // A, B, C, D...

                return (
                  <label
                    key={option.optionId}
                    className={`choice-row flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-500/10 text-[var(--app-text)] shadow-xs"
                        : "border-[var(--app-border)] text-[var(--app-muted)] hover:border-[var(--app-border-strong)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-raised)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option.optionId}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.questionId]: option.optionId,
                        }))
                      }
                      className="sr-only"
                    />

                    {/* Choice Letter badge */}
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold font-mono transition-colors ${
                        isSelected
                          ? "bg-teal-500 text-[var(--app-primary-ink)]"
                          : "border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface-solid)_60%,transparent)] text-[var(--app-subtle)]"
                      }`}
                    >
                      {letter}
                    </span>

                    <span className="flex-1 text-xs sm:text-sm font-medium">{option.text}</span>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        {status.error && (
          <p className="alert alert-error text-xs" role="alert">
            {status.error}
          </p>
        )}

        <button
          id="submit-poll-btn"
          type="submit"
          disabled={isExpired || submitting}
          className="btn btn-primary w-full text-sm font-semibold py-3.5 justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          <span>{isExpired ? "Poll Expired" : submitting ? "Submitting Response…" : "Submit Response"}</span>
        </button>
      </form>
    </AppShell>
  );
}
