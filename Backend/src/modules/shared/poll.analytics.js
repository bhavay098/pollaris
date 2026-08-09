// Pure analytics helpers: all take poll questions + response documents and
// return derived counts/percentages. No DB access or side effects, which
// keeps them easy to test and reuse across owner and public endpoints.

// Core counting routine. Returns a Map of questionId → { optionId: count }
// with every option seeded to 0, then increments counts for each answer.
// Shared by all the higher-level builders below.
const buildOptionCountMatrix = (questions = [], responses = []) => {
  const byQuestion = new Map();

  // Seed every option with a zero count so later lookups never miss.
  for (const question of questions) {
    byQuestion.set(
      question.questionId,
      Object.fromEntries(question.options.map((opt) => [opt.optionId, 0])),
    );
  }

  // Tally the selected options across all responses.
  for (const response of responses) {
    for (const answer of response.answers || []) {
      const optionCounts = byQuestion.get(answer.questionId);
      if (optionCounts && optionCounts[answer.selectedOptionId] !== undefined) {
        optionCounts[answer.selectedOptionId] += 1;
      }
    }
  }

  return byQuestion;
};

// Lightweight per-question option counts, used for live Socket.IO updates.
const buildQuestionWiseOptionCounts = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map((question) => ({
    questionId: question.questionId,
    optionCounts: matrix.get(question.questionId) || {},
  }));
};

// Full owner-side analytics: per question, list every option with its text
// and absolute vote count.
const buildQuestionAnalytics = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map((question) => ({
    questionId: question.questionId,
    text: question.text,
    isRequired: question.isRequired,
    options: question.options.map((option) => ({
      optionId: option.optionId,
      text: option.text,
      count: matrix.get(question.questionId)?.[option.optionId] || 0,
    })),
  }));
};

// Public result builder: same as question analytics but adds the percentage
// share of each option among the answered responses for that question.
const buildPublicQuestionResults = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map((question) => {
    const counts = matrix.get(question.questionId) || {};
    const answeredCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
      questionId: question.questionId,
      text: question.text,
      options: question.options.map((option) => {
        const count = counts[option.optionId] || 0;
        return {
          optionId: option.optionId,
          text: option.text,
          count,
          // Guard against division by zero when nobody answered the question.
          percentage: answeredCount ? Number(((count / answeredCount) * 100).toFixed(2)) : 0,
        };
      }),
    };
  });
};

// Per-question participation: how many respondents answered vs skipped.
const buildParticipationInsights = (questions = [], responses = []) =>
  questions.map((question) => {
    const answered = responses.filter((response) =>
      response.answers.some((answer) => answer.questionId === question.questionId),
    ).length;

    return {
      questionId: question.questionId,
      text: question.text,
      answeredCount: answered,
      // skipCount can't go negative even if a response oddly contains
      // duplicate answers to the same question.
      skipCount: Math.max(0, responses.length - answered),
    };
  });

// Splits total responses into anonymous vs authenticated buckets.
const buildParticipantBreakdown = (responses = []) => ({
  anonymous: responses.filter((r) => r.respondentType === "ANON").length,
  authenticated: responses.filter((r) => r.respondentType === "AUTH").length,
});

export {
  buildQuestionWiseOptionCounts,
  buildQuestionAnalytics,
  buildPublicQuestionResults,
  buildParticipationInsights,
  buildParticipantBreakdown,
};
