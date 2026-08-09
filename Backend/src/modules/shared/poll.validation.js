// Validates and normalizes poll input at the API boundary. Controllers call
// validateAndNormalizePollInput before persisting so the DB only ever sees
// clean, well-formed data. Throws ApiError on invalid input.

import ApiError from "../../common/utils/api-error.js";

// Response modes a poll can be created with.
const ALLOWED_RESPONSE_MODES = ["ANONYMOUS", "AUTHENTICATED"];

// Structural checks on the questions array: shape, presence of text, and a
// minimum of two options per question.
const validateQuestions = (questions = []) => {
  if (!Array.isArray(questions) || questions.length < 1) {
    throw ApiError.badRequest("Poll must contain at least one question");
  }

  for (const question of questions) {
    if (!question?.text?.trim()) {
      throw ApiError.badRequest("Each question must have text");
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw ApiError.badRequest("Each question must have at least two options");
    }

    for (const option of question.options) {
      if (!option?.text?.trim()) {
        throw ApiError.badRequest("Each option must have text");
      }
    }
  }
};

// Fills in any missing ids (client may not provide them), trims text, and
// defaults isRequired to true. Called after validation succeeds.
const normalizeQuestions = (questions = []) =>
  questions.map((q, qIndex) => ({
    questionId: q.questionId || `q_${qIndex + 1}_${Date.now()}`,
    text: q.text.trim(),
    isRequired: q.isRequired !== false,
    options: q.options.map((o, oIndex) => ({
      optionId: o.optionId || `o_${qIndex + 1}_${oIndex + 1}_${Date.now()}`,
      text: o.text.trim(),
    })),
  }));

// Main entry point: validates top-level poll fields and delegates the
// questions to the helpers above, then returns a clean object to persist.
const validateAndNormalizePollInput = ({
  title,
  description,
  responseMode,
  expiresAt,
  questions,
}) => {
  if (!title?.trim()) {
    throw ApiError.badRequest("Title is required");
  }

  // Expiry must be a real date in the future; reject anything else outright.
  const expiry = new Date(expiresAt);
  if (!expiresAt || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
    throw ApiError.badRequest("Expiry must be a valid future datetime");
  }

  if (!ALLOWED_RESPONSE_MODES.includes(responseMode)) {
    throw ApiError.badRequest("Invalid response mode");
  }

  validateQuestions(questions);

  return {
    title: title.trim(),
    description: description?.trim() || "",
    responseMode,
    expiresAt: expiry,
    questions: normalizeQuestions(questions),
  };
};

export { validateAndNormalizePollInput };
