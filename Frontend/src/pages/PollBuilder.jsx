// Poll editor (routes "/dashboard/polls/new" and "/dashboard/polls/:pollId/edit").
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";
import ExpiryPresets from "../Components/builder/ExpiryPresets.jsx";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  Settings2,
} from "lucide-react";

// Factory for a fresh blank question
const blankQuestion = () => ({
  questionId: `q_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  text: "",
  isRequired: true,
  options: [
    { optionId: `o_${Date.now()}_1`, text: "" },
    { optionId: `o_${Date.now()}_2`, text: "" },
  ],
});

// Format Date for datetime inputs
const toDatetimeLocalValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function PollBuilder() {
  const { pollId } = useParams();
  const isEdit = useMemo(() => Boolean(pollId), [pollId]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    responseMode: "ANONYMOUS",
    expiryDate: "",
    expiryTime: "",
    questions: [blankQuestion()],
  });
  const [loading, setLoading] = useState(false);

  const localTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "";
    }
  }, []);

  // Edit mode: load existing poll
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    const loadPoll = async () => {
      try {
        const response = await api.getPollById(pollId);
        const poll = response.data.poll;
        if (!cancelled) {
          const local = toDatetimeLocalValue(new Date(poll.expiresAt));
          setForm({
            title: poll.title,
            description: poll.description || "",
            responseMode: poll.responseMode,
            expiryDate: local.slice(0, 10),
            expiryTime: local.slice(11),
            questions: poll.questions,
          });
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      }
    };

    void loadPoll();
    return () => {
      cancelled = true;
    };
  }, [isEdit, pollId]);

  // Question helpers
  const updateQuestion = (index, patch) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], ...patch };
      return { ...prev, questions };
    });
  };

  const updateOption = (qIndex, oIndex, text) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = { ...options[oIndex], text };
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, blankQuestion()],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => {
      if (prev.questions.length === 1) {
        toast.info("A poll must have at least one question.");
        return prev;
      }
      return {
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      };
    });
  };

  const moveQuestion = (index, direction) => {
    setForm((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.questions.length) return prev;
      const questions = [...prev.questions];
      const temp = questions[index];
      questions[index] = questions[targetIndex];
      questions[targetIndex] = temp;
      return { ...prev, questions };
    });
  };

  const addOption = (qIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [
        ...questions[qIndex].options,
        {
          optionId: `o_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
          text: "",
        },
      ];
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      if (questions[qIndex].options.length <= 2) {
        toast.info("A question must have at least 2 choices.");
        return prev;
      }
      questions[qIndex] = {
        ...questions[qIndex],
        options: questions[qIndex].options.filter((_, i) => i !== oIndex),
      };
      return { ...prev, questions };
    });
  };

  const moveOption = (qIndex, oIndex, direction) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      const targetIndex = oIndex + direction;
      if (targetIndex < 0 || targetIndex >= options.length) return prev;
      const temp = options[oIndex];
      options[oIndex] = options[targetIndex];
      options[targetIndex] = temp;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  // Quick choice templates
  const applyChoiceTemplate = (qIndex, templateType) => {
    let newOptions = [];
    const makeOpt = (text) => ({
      optionId: `o_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      text,
    });

    if (templateType === "yes_no") {
      newOptions = [makeOpt("Yes"), makeOpt("No")];
    } else if (templateType === "agreement") {
      newOptions = [
        makeOpt("Strongly Agree"),
        makeOpt("Agree"),
        makeOpt("Neutral"),
        makeOpt("Disagree"),
        makeOpt("Strongly Disagree"),
      ];
    } else if (templateType === "rating") {
      newOptions = [
        makeOpt("1 Star - Poor"),
        makeOpt("2 Stars - Fair"),
        makeOpt("3 Stars - Good"),
        makeOpt("4 Stars - Very Good"),
        makeOpt("5 Stars - Excellent"),
      ];
    }

    setForm((prev) => {
      const questions = [...prev.questions];
      questions[qIndex] = { ...questions[qIndex], options: newOptions };
      return { ...prev, questions };
    });
    toast.success("Applied choice template!");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      responseMode: form.responseMode,
      expiresAt: `${form.expiryDate}T${form.expiryTime}`,
      questions: form.questions,
    };

    try {
      if (isEdit) {
        await api.updatePoll(pollId, payload);
      } else {
        await api.createPoll(payload);
      }
      toast.success(isEdit ? "Poll updated successfully!" : "Poll created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Poll studio / {isEdit ? "revision" : "new signal"}</span>
          <h1 className="page-title">{isEdit ? "Tune the question set." : "Build a better question."}</h1>
          <p className="page-description">
            Give your audience a focused prompt, a clear set of choices, and enough context to answer with confidence.
          </p>
        </div>
        <Link to="/dashboard" className="btn btn-quiet">
          Back to dashboard
        </Link>
      </div>

      <form onSubmit={submit} className="builder-grid max-w-3xl space-y-6">
        {/* Details Panel */}
        <section className="panel builder-details" aria-labelledby="poll-details-heading">
          <div className="panel-heading">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <span className="eyebrow text-[10px]">01 / framing</span>
                <h2 id="poll-details-heading" className="panel-title text-base font-bold">
                  Set the context
                </h2>
              </div>
            </div>
          </div>

          <div className="field mt-4">
            <label htmlFor="poll-title">Poll title</label>
            <input
              id="poll-title"
              placeholder="e.g. What should we improve next?"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="poll-description">
              Description <span className="muted">(optional)</span>
            </label>
            <textarea
              id="poll-description"
              placeholder="A short note that helps people understand the decision behind this poll."
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="field">
            <label htmlFor="response-mode">Who can respond?</label>
            <select
              id="response-mode"
              value={form.responseMode}
              onChange={(e) => setForm((prev) => ({ ...prev, responseMode: e.target.value }))}
            >
              <option value="ANONYMOUS">Anyone, anonymously</option>
              <option value="AUTHENTICATED">Signed-in people only</option>
            </select>
          </div>

          <div className="split-fields">
            <div className="field">
              <label htmlFor="expiry-date">Expiry date</label>
              <input
                id="expiry-date"
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="expiry-time">Expiry time</label>
              <input
                id="expiry-time"
                type="time"
                required
                value={form.expiryTime}
                onChange={(e) => setForm((prev) => ({ ...prev, expiryTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Expiry Presets */}
          <ExpiryPresets
            onSelectPreset={({ expiryDate, expiryTime }) =>
              setForm((prev) => ({ ...prev, expiryDate, expiryTime }))
            }
          />

          <p className="muted text-[11px]" style={{ marginTop: "-2px" }}>
            Expiry uses your local timezone{localTimezone ? ` (${localTimezone})` : ""}.
          </p>
        </section>

        {/* Question Cards */}
        {form.questions.map((question, qIndex) => (
          <section
            key={question.questionId}
            className="question-card space-y-4"
            aria-labelledby={`question-heading-${question.questionId}`}
          >
            {/* Question card header with Reorder and Remove buttons */}
            <div className="card-heading">
              <div className="flex items-center gap-3">
                <span className="question-index">{String(qIndex + 1).padStart(2, "0")}</span>
                <div>
                  <span className="eyebrow text-[10px]">Question block</span>
                  <h2 id={`question-heading-${question.questionId}`} className="card-title text-base font-bold">
                    Question {qIndex + 1}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  disabled={qIndex === 0}
                  onClick={() => moveQuestion(qIndex, -1)}
                  className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move Question Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={qIndex === form.questions.length - 1}
                  onClick={() => moveQuestion(qIndex, 1)}
                  className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-raised)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move Question Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-danger)] hover:bg-red-500/10 transition-colors ml-1"
                  title="Remove Question"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="field">
              <label htmlFor={`question-${question.questionId}`}>Question text</label>
              <input
                id={`question-${question.questionId}`}
                placeholder="Write the question your audience can answer."
                required
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
              />
            </div>

            {/* Required Toggle */}
            <label className="check-row text-xs">
              <input
                type="checkbox"
                checked={question.isRequired}
                onChange={(e) => updateQuestion(qIndex, { isRequired: e.target.checked })}
              />
              <span>Require respondents to answer this question</span>
            </label>

            {/* Choice Templates Header */}
            <div className="pt-2 border-t border-[var(--app-border)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-[var(--app-muted)]">Choices</span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[var(--app-subtle)] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-teal-400" /> Templates:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyChoiceTemplate(qIndex, "yes_no")}
                    className="px-2 py-0.5 rounded-md border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] text-[10px] hover:bg-[var(--app-surface-raised)]"
                  >
                    Yes / No
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChoiceTemplate(qIndex, "agreement")}
                    className="px-2 py-0.5 rounded-md border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] text-[10px] hover:bg-[var(--app-surface-raised)]"
                  >
                    5-pt Agreement
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChoiceTemplate(qIndex, "rating")}
                    className="px-2 py-0.5 rounded-md border border-[var(--app-border)] text-[var(--app-muted)] hover:text-[var(--app-text)] text-[10px] hover:bg-[var(--app-surface-raised)]"
                  >
                    1-5 Stars
                  </button>
                </div>
              </div>

              {/* Option Rows with Reordering */}
              <div className="question-options space-y-2.5">
                {question.options.map((option, oIndex) => (
                  <div key={option.optionId} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[var(--app-subtle)] w-5 text-right flex-shrink-0">
                      {oIndex + 1}.
                    </span>
                    <div className="flex-1">
                      <input
                        id={`option-${option.optionId}`}
                        placeholder={`Answer option ${oIndex + 1}`}
                        required
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="w-full min-h-[40px] text-xs px-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-raised)] text-[var(--app-text)] outline-none"
                      />
                    </div>

                    {/* Option Up/Down controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        disabled={oIndex === 0}
                        onClick={() => moveOption(qIndex, oIndex, -1)}
                        className="p-1 rounded-lg border border-[var(--app-border)] text-[var(--app-subtle)] hover:text-[var(--app-text)] disabled:opacity-20"
                        title="Move Option Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={oIndex === question.options.length - 1}
                        onClick={() => moveOption(qIndex, oIndex, 1)}
                        className="p-1 rounded-lg border border-[var(--app-border)] text-[var(--app-subtle)] hover:text-[var(--app-text)] disabled:opacity-20"
                        title="Move Option Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded-lg border border-[var(--app-border)] text-[var(--app-danger)] hover:bg-red-500/10"
                        aria-label={`Remove choice ${oIndex + 1}`}
                        onClick={() => removeOption(qIndex, oIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-quiet text-xs py-2 px-3 gap-1.5 mt-2"
                  onClick={() => addOption(qIndex)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add another choice</span>
                </button>
              </div>
            </div>
          </section>
        ))}

        {/* Form Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--app-border)]">
          <button
            type="button"
            className="btn btn-secondary text-xs py-2.5 px-4 gap-2"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary text-xs py-2.5 px-6 gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving…" : isEdit ? "Save Changes" : "Create Poll"}</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
