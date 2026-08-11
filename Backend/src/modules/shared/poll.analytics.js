// Pure analytics helpers: all take poll questions + response documents and return derived counts/percentages.
// No DB access or side effects, which keeps them easy to test and reuse across owner and public endpoints.

// ---------------------------------------------------------------------------
// Core counting routine.
// Returns a Map of questionId → { optionId: count }.
// Every option is seeded to 0, then counts are incremented for each answer.
// Shared by all the higher-level builders below.
// ---------------------------------------------------------------------------
const buildOptionCountMatrix = (questions = [], responses = []) => {
  // Create a Map where each key is a questionId and each value is an object of option counts.
  const byQuestion = new Map();

  // Seed every option with a zero count so later lookups never miss.
  // Loop over every question in the poll.
  for (const question of questions) {
    // Set the Map entry for this question.
    // The value is built from an array of [key, value] pairs created by Object.fromEntries.
    // We map each option in the question to its own entry: optionId → initial count of 0.
    byQuestion.set(
      question.questionId,
      Object.fromEntries(question.options.map((opt) => [opt.optionId, 0])),
    );
  }

  // Tally the selected options across all responses.
  // Loop over every response document in the poll.
  for (const response of responses) {
    // Loop over each individual answer inside the response.
    // `response.answers || []` guards against a response with no answers array.
    for (const answer of response.answers || []) {
      // Look up the option-counts object for the question this answer belongs to.
      const optionCounts = byQuestion.get(answer.questionId);
      // Only increment if the question exists in our matrix AND the selected option is a known option.
      // This skips answers that reference questions/options we don't know about.
      if (optionCounts && optionCounts[answer.selectedOptionId] !== undefined) {
        // Bump that option's count by one.
        optionCounts[answer.selectedOptionId] += 1;
      }
    }
  }

  // Hand the fully-built Map back to the caller.
  return byQuestion;
};

// ---------------------------------------------------------------------------
// Lightweight per-question option counts, used for live Socket.IO updates.
// ---------------------------------------------------------------------------
const buildQuestionWiseOptionCounts = (questions = [], responses = []) => {
  // Reuse the shared counting routine to get the option-count matrix.
  const matrix = buildOptionCountMatrix(questions, responses);

  // Build a slim result array with one entry per question.
  // `|| {}` ensures we always return an object even if the question is missing from the matrix.
  return questions.map((question) => ({
    // Copy over the question's unique identifier.
    questionId: question.questionId,
    // Pull the option counts for this question from the matrix.
    optionCounts: matrix.get(question.questionId) || {},
  }));
};

// ---------------------------------------------------------------------------
// Full owner-side analytics: per question, list every option with its text
// and absolute vote count.
// ---------------------------------------------------------------------------
const buildQuestionAnalytics = (questions = [], responses = []) => {
  // Reuse the shared counting routine to get the option-count matrix.
  const matrix = buildOptionCountMatrix(questions, responses);

  // Build one analytics object per question.
  // `|| 0` guards against an option missing from the matrix (count defaults to 0).
  return questions.map((question) => ({
    // Copy over the question's unique identifier.
    questionId: question.questionId,
    // Copy over the question's text as displayed to voters.
    text: question.text,
    // Copy over whether this question was mandatory to answer.
    isRequired: question.isRequired,
    // Build the list of options with their individual vote counts.
    options: question.options.map((option) => ({
      // Copy over the option's unique identifier.
      optionId: option.optionId,
      // Copy over the option's text as displayed to voters.
      text: option.text,
      // Look up the raw vote count for this option, defaulting to 0.
      count: matrix.get(question.questionId)?.[option.optionId] || 0,
    })),
  }));
};

// ---------------------------------------------------------------------------
// Public result builder: same as question analytics but adds the percentage
// share of each option among the answered responses for that question.
// ---------------------------------------------------------------------------
const buildPublicQuestionResults = (questions = [], responses = []) => {
  // Reuse the shared counting routine to get the option-count matrix.
  const matrix = buildOptionCountMatrix(questions, responses);

  // Build one result object per question.
  // `|| {}` ensures we always work with an object even if the question is missing from the matrix.
  return questions.map((question) => {
    // Pull the option counts for this question out of the matrix.
    const counts = matrix.get(question.questionId) || {};
    // Sum all option counts to get the total number of answered responses for this question.
    // This is the denominator used to compute each option's percentage share.
    const answeredCount = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0,
    );

    // Assemble the final result for this question.
    return {
      // Copy over the question's unique identifier.
      questionId: question.questionId,
      // Copy over the question's text as displayed to voters.
      text: question.text,
      // Build the list of options with both raw counts and percentage shares.
      options: question.options.map((option) => {
        // Look up the raw vote count for this option, defaulting to 0.
        const count = counts[option.optionId] || 0;
        // Emit the per-option result.
        return {
          // Copy over the option's unique identifier.
          optionId: option.optionId,
          // Copy over the option's text as displayed to voters.
          text: option.text,
          // Include the raw absolute vote count for this option.
          count,
          // Compute the percentage share: (option votes / total answered votes) * 100.
          // Guard against division by zero when nobody answered the question.
          // If no one answered, report 0%. Otherwise round to two decimal places.
          percentage: answeredCount
            ? Number(((count / answeredCount) * 100).toFixed(2))
            : 0,
        };
      }),
    };
  });
};

// ---------------------------------------------------------------------------
// Per-question participation: how many respondents answered vs skipped.
// ---------------------------------------------------------------------------
const buildParticipationInsights = (questions = [], responses = []) =>
  // Map each question to its participation stats.
  questions.map((question) => {
    // Count how many responses answered this question:
    // keep a response only if at least one of its answers references this questionId.
    const answered = responses.filter((response) =>
      response.answers.some(
        (answer) => answer.questionId === question.questionId,
      ),
    ).length;

    // Emit the participation stats for this question.
    return {
      // Copy over the question's unique identifier.
      questionId: question.questionId,
      // Copy over the question's text as displayed to voters.
      text: question.text,
      // Number of respondents who answered this question.
      answeredCount: answered,
      // Number of respondents who skipped it = total responses minus answered.
      // skipCount can't go negative even if a response oddly contains
      // duplicate answers to the same question.
      // Math.max(0, ...) clamps the result to zero just in case.
      skipCount: Math.max(0, responses.length - answered),
    };
  });

// ---------------------------------------------------------------------------
// Splits total responses into anonymous vs authenticated buckets.
// ---------------------------------------------------------------------------
const buildParticipantBreakdown = (responses = []) => ({
  // Count responses whose respondentType is "ANON" (anonymous participants).
  anonymous: responses.filter((r) => r.respondentType === "ANON").length,
  // Count responses whose respondentType is "AUTH" (authenticated participants).
  authenticated: responses.filter((r) => r.respondentType === "AUTH").length,
});

// Export every helper so other modules (owner endpoints, public endpoints,
// Socket.IO handlers) can import exactly what they need.
export {
  buildQuestionWiseOptionCounts,
  buildQuestionAnalytics,
  buildPublicQuestionResults,
  buildParticipationInsights,
  buildParticipantBreakdown,
};
