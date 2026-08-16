// Poll editor (routes "/dashboard/polls/new" and "/dashboard/polls/:pollId/edit").
// The same component handles both modes: no :pollId in the URL = create mode,
// :pollId present = edit mode (it pre-fills the form from the backend).
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import AppShell from "../Components/AppShell.jsx";
import { toast } from "sonner";

// Factory that returns a fresh, empty question with two blank options.
// IDs are generated with a timestamp + random suffix so each is unique.
const blankQuestion = () => ({
  questionId: `q_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  text: "",
  isRequired: true,
  options: [
    { optionId: `o_${Date.now()}_1`, text: "" },
    { optionId: `o_${Date.now()}_2`, text: "" },
  ],
});

// Format a Date for a <input type="datetime-local">, which expects local time.
// ISO string methods return UTC, which would shift the displayed time by the
// user's timezone offset.
const toDatetimeLocalValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function PollBuilder() {
  const { pollId } = useParams();
  // If the URL has a pollId, we're editing an existing poll.
  const isEdit = useMemo(() => Boolean(pollId), [pollId]);
  const navigate = useNavigate();

  // Entire poll being edited, including all questions and their options.
  // Expiry is split into date + time so each has its own clearly-labeled input.
  const [form, setForm] = useState({
    title: "",
    description: "",
    responseMode: "ANONYMOUS",
    expiryDate: "",
    expiryTime: "",
    questions: [blankQuestion()],
  });
  const [loading, setLoading] = useState(false);

  // e.g. "Asia/Kolkata" — shown as a hint so users know expiry uses local time.
  const localTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "";
    }
  }, []);

  // Edit mode: load the existing poll and populate the form once.
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    const loadPoll = async () => {
      try {
        const response = await api.getPollById(pollId);
        const poll = response.data.poll;
        if (!cancelled) {
          // Convert the stored expiry to local time, then split it into
          // "YYYY-MM-DD" (date input) and "HH:MM" (time input).
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

  // --- Immutable state updates for the question list ---
  // Each helper copies the nested arrays before changing anything, so React
  // sees a new object reference and re-renders correctly.

  // Merge `patch` (e.g. { text }) into one question by index.
  const updateQuestion = (index, patch) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[index] = { ...questions[index], ...patch };
      return { ...prev, questions };
    });
  };

  // Change the text of one option inside a question.
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
    setForm((prev) => ({ ...prev, questions: [...prev.questions, blankQuestion()] }));
  };

  // Never allow removing the last remaining question.
  const removeQuestion = (index) => {
    setForm((prev) => {
      if (prev.questions.length === 1) return prev;
      return { ...prev, questions: prev.questions.filter((_, i) => i !== index) };
    });
  };

  const addOption = (qIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options, { optionId: `o_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`, text: "" }];
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  // Keep at least 2 options per question.
  const removeOption = (qIndex, oIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      if (questions[qIndex].options.length <= 2) return prev;
      questions[qIndex] = {
        ...questions[qIndex],
        options: questions[qIndex].options.filter((_, i) => i !== oIndex),
      };
      return { ...prev, questions };
    });
  };

  // Save: POST for new polls, PATCH for edits, then return to the dashboard.
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Recombine the split date + time inputs into the ISO-style string the
    // backend expects. Both are required, so the API never sees a partial value.
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
          <p className="page-description">Give your audience a focused prompt, a clear set of choices, and enough context to answer with confidence.</p>
        </div>
        <Link to="/dashboard" className="btn btn-quiet">Back to dashboard</Link>
      </div>

      <form onSubmit={submit} className="builder-grid">
        <section className="panel builder-details" aria-labelledby="poll-details-heading">
          <div className="panel-heading">
            <div><span className="eyebrow">01 / framing</span><h2 id="poll-details-heading" className="panel-title">Set the context</h2></div>
            <span className="meta-label">Required fields marked by form</span>
          </div>
          <div className="field">
            <label htmlFor="poll-title">Poll title</label>
            <input id="poll-title" placeholder="e.g. What should we improve next?" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="poll-description">Description <span className="muted">(optional)</span></label>
            <textarea id="poll-description" placeholder="A short note that helps people understand the decision behind this poll." rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="response-mode">Who can respond?</label>
            <select id="response-mode" value={form.responseMode} onChange={(e) => setForm((prev) => ({ ...prev, responseMode: e.target.value }))}>
              <option value="ANONYMOUS">Anyone, anonymously</option>
              <option value="AUTHENTICATED">Signed-in people only</option>
            </select>
          </div>
          <div className="split-fields">
            <div className="field">
              <label htmlFor="expiry-date">Expiry date</label>
              <input id="expiry-date" type="date" required value={form.expiryDate} onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="expiry-time">Expiry time</label>
              <input id="expiry-time" type="time" required value={form.expiryTime} onChange={(e) => setForm((prev) => ({ ...prev, expiryTime: e.target.value }))} />
            </div>
          </div>
          <p className="muted" style={{ marginTop: "-6px" }}>Expiry is in your local timezone{localTimezone ? ` (${localTimezone})` : ""}.</p>
        </section>

        {form.questions.map((question, qIndex) => (
          <section key={question.questionId} className="question-card" aria-labelledby={`question-heading-${question.questionId}`}>
            <div className="card-heading">
              <div className="flex items-center gap-3">
                <span className="question-index">{String(qIndex + 1).padStart(2, "0")}</span>
                <div><span className="eyebrow">Question block</span><h2 id={`question-heading-${question.questionId}`} className="card-title">Ask something useful</h2></div>
              </div>
              <button type="button" className="btn btn-danger" onClick={() => removeQuestion(qIndex)}>Remove</button>
            </div>

            <div className="field" style={{ marginTop: "20px" }}>
              <label htmlFor={`question-${question.questionId}`}>Question text</label>
              <input id={`question-${question.questionId}`} placeholder="Write the question your audience can answer." required value={question.text} onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} />
            </div>

            <label className="check-row" style={{ marginTop: "15px" }}>
              <input type="checkbox" checked={question.isRequired} onChange={(e) => updateQuestion(qIndex, { isRequired: e.target.checked })} />
              Require an answer
            </label>

            <div className="question-options">
              {question.options.map((option, oIndex) => (
                <div key={option.optionId} className="option-row">
                  <div className="field">
                    <label htmlFor={`option-${option.optionId}`}>Choice {oIndex + 1}</label>
                    <input id={`option-${option.optionId}`} placeholder={`Answer option ${oIndex + 1}`} required value={option.text} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} />
                  </div>
                  <button type="button" className="icon-button" aria-label={`Remove choice ${oIndex + 1}`} onClick={() => removeOption(qIndex, oIndex)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-quiet" onClick={() => addOption(qIndex)}>+ Add another choice</button>
            </div>
          </section>
        ))}

        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>+ Add question</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Saving…" : isEdit ? "Save changes" : "Create poll"}</button>
        </div>
      </form>
    </AppShell>
  );
}
