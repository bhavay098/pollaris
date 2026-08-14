// Poll editor (routes "/dashboard/polls/new" and "/dashboard/polls/:pollId/edit").
// The same component handles both modes: no :pollId in the URL = create mode,
// :pollId present = edit mode (it pre-fills the form from the backend).
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

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

export default function PollBuilder() {
  const { pollId } = useParams();
  // If the URL has a pollId, we're editing an existing poll.
  const isEdit = useMemo(() => Boolean(pollId), [pollId]);
  const navigate = useNavigate();

  // Entire poll being edited, including all questions and their options.
  const [form, setForm] = useState({
    title: "",
    description: "",
    responseMode: "ANONYMOUS",
    expiresAt: "",
    questions: [blankQuestion()],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit mode: load the existing poll and populate the form once.
  useEffect(() => {
    if (!isEdit) return;

    const loadPoll = async () => {
      try {
        const response = await api.getPollById(pollId);
        const poll = response.data.poll;
        setForm({
          title: poll.title,
          description: poll.description || "",
          responseMode: poll.responseMode,
          // datetime-local inputs expect "YYYY-MM-DDTHH:MM"; slice drops seconds.
          expiresAt: new Date(poll.expiresAt).toISOString().slice(0, 16),
          questions: poll.questions,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    loadPoll();
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
    setError("");
    setLoading(true);

    try {
      if (isEdit) {
        await api.updatePoll(pollId, form);
      } else {
        await api.createPoll(form);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Poll" : "Create Poll"}</h1>
          <Link to="/dashboard" className="text-teal-400">Back</Link>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Poll title" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <textarea className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            <div className="grid md:grid-cols-2 gap-3">
              <select className="w-full p-3 rounded-xl bg-zinc-800" value={form.responseMode} onChange={(e) => setForm((prev) => ({ ...prev, responseMode: e.target.value }))}>
                <option value="ANONYMOUS">Anonymous responses</option>
                <option value="AUTHENTICATED">Authenticated responses</option>
              </select>
              <input className="w-full p-3 rounded-xl bg-zinc-800" type="datetime-local" required value={form.expiresAt} onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))} />
            </div>
          </div>

          {/* Render one editable card per question, with its options */}
          {form.questions.map((question, qIndex) => (
            <div key={question.questionId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Question {qIndex + 1}</h2>
                <button type="button" className="text-red-400 text-sm" onClick={() => removeQuestion(qIndex)}>Remove</button>
              </div>

              <input className="w-full p-3 rounded-xl bg-zinc-800" placeholder="Question text" required value={question.text} onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} />

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={question.isRequired} onChange={(e) => updateQuestion(qIndex, { isRequired: e.target.checked })} />
                Required question
              </label>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <div key={option.optionId} className="flex gap-2">
                    <input className="flex-1 p-3 rounded-xl bg-zinc-800" placeholder={`Option ${oIndex + 1}`} required value={option.text} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} />
                    <button type="button" className="px-3 rounded-xl bg-zinc-800" onClick={() => removeOption(qIndex, oIndex)}>X</button>
                  </div>
                ))}
                <button type="button" className="text-teal-400 text-sm" onClick={() => addOption(qIndex)}>+ Add option</button>
              </div>
            </div>
          ))}

          {error ? <p className="text-red-400">{error}</p> : null}

          <div className="flex gap-3">
            <button type="button" className="bg-zinc-800 hover:bg-zinc-700 px-4 py-3 rounded-xl" onClick={addQuestion}>+ Add question</button>
            <button disabled={loading} className="bg-teal-500 hover:bg-teal-600 px-4 py-3 rounded-xl font-semibold">{loading ? "Saving..." : isEdit ? "Update Poll" : "Create Poll"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
