// Pure helpers for deriving poll analytics from questions and responses.
// They do not read from the database or modify the input arrays, so controllers
// can reuse them for API responses and Socket.IO events.

// Build one lookup table for all questions:
// Map<questionId, { optionId: voteCount }>.
// Starting every option at 0 means options with no votes still appear in results.
const buildOptionCountMatrix = (questions = [], responses = []) => {
  const matrix = new Map(
    questions.map((question) => [
      question.questionId,
      Object.fromEntries(question.options.map(({ optionId }) => [optionId, 0])),
    ]),
  );

  // Count only answers that still match a question and option in this poll.
  // This also safely ignores stale or malformed stored answers.
  for (const { answers = [] } of responses) {
    for (const { questionId, selectedOptionId } of answers) {
      const optionCounts = matrix.get(questionId);

      // Optional chaining handles an unknown question. Checking against
      // `undefined` (rather than truthiness) allows a valid zero count to increment.
      if (optionCounts?.[selectedOptionId] !== undefined) {
        optionCounts[selectedOptionId] += 1;
      }
    }
  }

  return matrix;
};

// Lightweight option counts used by Socket.IO updates.
// Example: { questionId: "q1", optionCounts: { a: 3, b: 1 } }
const buildQuestionWiseOptionCounts = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map(({ questionId }) => ({
    questionId,
    optionCounts: matrix.get(questionId) || {},
  }));
};

// Owner-facing option analytics with question metadata.
// Unlike the socket payload, this includes display text and whether the question is required.
const buildQuestionAnalytics = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map(({ questionId, text, isRequired, options }) => ({
    questionId,
    text,
    isRequired,
    options: options.map((option) => ({
      optionId: option.optionId,
      text: option.text,
      count: matrix.get(questionId)?.[option.optionId] || 0,
    })),
  }));
};

// Public option analytics including each option's share of answered votes.
// A skipped question is excluded from its denominator: percentages add up to 100%
// among people who answered that particular question.
const buildPublicQuestionResults = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map(({ questionId, text, options }) => {
    const counts = matrix.get(questionId) || {};
    // Counts are mutually exclusive per question, so their sum is the number
    // of submitted answers for this question.
    const answeredCount = Object.values(counts).reduce(
      (total, count) => total + count,
      0,
    );

    return {
      questionId,
      text,
      options: options.map((option) => {
        const count = counts[option.optionId] || 0;

        return {
          optionId: option.optionId,
          text: option.text,
          count,
          // Avoid division by zero when there are no answers, then round to
          // two decimal places before returning a Number instead of a string.
          percentage: answeredCount
            ? Number(((count / answeredCount) * 100).toFixed(2))
            : 0,
        };
      }),
    };
  });
};

// Per-question respondent participation.
// Convert each response's answers into a Set, so a malformed duplicate answer
// cannot cause the same respondent to be counted more than once.
const buildParticipationInsights = (questions = [], responses = []) => {
  const answeredQuestionIds = responses.map(
    ({ answers = [] }) => new Set(answers.map(({ questionId }) => questionId)),
  );

  return questions.map(({ questionId, text }) => {
    // Count respondents whose answer set contains this question.
    const answeredCount = answeredQuestionIds.filter((ids) => ids.has(questionId)).length;

    return {
      questionId,
      text,
      answeredCount,
      skipCount: Math.max(0, responses.length - answeredCount),
    };
  });
};

// Response totals split by anonymous and authenticated participants.
// `reduce` carries a single running object instead of filtering the full list twice.
const buildParticipantBreakdown = (responses = []) =>
  responses.reduce(
    (breakdown, { respondentType }) => {
      if (respondentType === "ANON") breakdown.anonymous += 1;
      if (respondentType === "AUTH") breakdown.authenticated += 1;
      return breakdown;
    },
    { anonymous: 0, authenticated: 0 },
  );

export {
  buildQuestionWiseOptionCounts,
  buildQuestionAnalytics,
  buildPublicQuestionResults,
  buildParticipationInsights,
  buildParticipantBreakdown,
};
