// Validates and normalizes poll input at the API boundary. Controllers call
// validateAndNormalizePollInput before persisting so the DB only ever sees
// clean, well-formed data. Throws ApiError on invalid input.

import ApiError from "../../common/utils/api-error.js";

// Response modes a poll can be created with.
const ALLOWED_RESPONSE_MODES = ["ANONYMOUS", "AUTHENTICATED"];
const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 800;
const MAX_QUESTION_LENGTH = 500;
const MAX_OPTION_LENGTH = 200;
const MAX_ID_LENGTH = 100;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateOptionalId = (value, label) => {
  if (value === undefined) return;

  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > MAX_ID_LENGTH
  ) {
    throw ApiError.badRequest(`${label} must be a non-empty string`);
  }
};

// Structural checks on the questions array: shape, presence of text, and a
// minimum of two options per question.
const validateQuestions = (questions = []) => {
  if (!Array.isArray(questions) || questions.length < 1) {
    throw ApiError.badRequest("Poll must contain at least one question");
  }

  const questionIds = new Set();

  for (const question of questions) {
    if (!isPlainObject(question) || typeof question.text !== "string" || !question.text.trim()) {
      throw ApiError.badRequest("Each question must have text");
    }

    if (question.text.trim().length > MAX_QUESTION_LENGTH) {
      throw ApiError.badRequest(`Question text cannot exceed ${MAX_QUESTION_LENGTH} characters`);
    }

    validateOptionalId(question.questionId, "Question ID");
    const questionId = question.questionId?.trim();
    if (questionId && questionIds.has(questionId)) {
      throw ApiError.badRequest("Question IDs must be unique");
    }
    if (questionId) questionIds.add(questionId);

    if (question.isRequired !== undefined && typeof question.isRequired !== "boolean") {
      throw ApiError.badRequest("isRequired must be a boolean");
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw ApiError.badRequest("Each question must have at least two options");
    }

    const optionIds = new Set();
    for (const option of question.options) {
      if (!isPlainObject(option) || typeof option.text !== "string" || !option.text.trim()) {
        throw ApiError.badRequest("Each option must have text");
      }

      if (option.text.trim().length > MAX_OPTION_LENGTH) {
        throw ApiError.badRequest(`Option text cannot exceed ${MAX_OPTION_LENGTH} characters`);
      }

      validateOptionalId(option.optionId, "Option ID");
      const optionId = option.optionId?.trim();
      if (optionId && optionIds.has(optionId)) {
        throw ApiError.badRequest("Option IDs must be unique within a question");
      }
      if (optionId) optionIds.add(optionId);
    }
  }
};

// Fills in any missing ids (client may not provide them), trims text, and
// defaults isRequired to true. Called after validation succeeds.
const normalizeQuestions = (questions = []) =>
  questions.map((q, qIndex) => ({
    questionId: q.questionId?.trim() || `q_${qIndex + 1}_${Date.now()}`,
    text: q.text.trim(),
    isRequired: q.isRequired !== false,
    options: q.options.map((o, oIndex) => ({
      optionId: o.optionId?.trim() || `o_${qIndex + 1}_${oIndex + 1}_${Date.now()}`,
      text: o.text.trim(),
    })),
  }));

// Main entry point: validates top-level poll fields and delegates the
// questions to the helpers above, then returns a clean object to persist.
const validateAndNormalizePollInput = (input = {}) => {
  const payload = isPlainObject(input) ? input : {};
  const { title, description, responseMode, expiresAt, questions } = payload;

  if (typeof title !== "string" || !title.trim()) {
    throw ApiError.badRequest("Title is required");
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    throw ApiError.badRequest(`Title cannot exceed ${MAX_TITLE_LENGTH} characters`);
  }

  if (description !== undefined && typeof description !== "string") {
    throw ApiError.badRequest("Description must be a string");
  }

  if (description?.trim().length > MAX_DESCRIPTION_LENGTH) {
    throw ApiError.badRequest(
      `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
    );
  }

  // Expiry must be a real date in the future; reject anything else outright.
  const expiry = new Date(expiresAt);
  if (!expiresAt || Number.isNaN(expiry.getTime()) || expiry <= new Date()) {
    throw ApiError.badRequest("Expiry must be a valid future datetime");
  }

  if (typeof responseMode !== "string" || !ALLOWED_RESPONSE_MODES.includes(responseMode)) {
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
