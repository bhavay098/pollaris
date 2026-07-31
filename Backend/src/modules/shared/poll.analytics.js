const buildOptionCountMatrix = (questions = [], responses = []) => {
  const byQuestion = new Map();

  for (const question of questions) {
    byQuestion.set(
      question.questionId,
      Object.fromEntries(question.options.map((opt) => [opt.optionId, 0])),
    );
  }

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

const buildQuestionWiseOptionCounts = (questions = [], responses = []) => {
  const matrix = buildOptionCountMatrix(questions, responses);

  return questions.map((question) => ({
    questionId: question.questionId,
    optionCounts: matrix.get(question.questionId) || {},
  }));
};

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
          percentage: answeredCount ? Number(((count / answeredCount) * 100).toFixed(2)) : 0,
        };
      }),
    };
  });
};

const buildParticipationInsights = (questions = [], responses = []) =>
  questions.map((question) => {
    const answered = responses.filter((response) =>
      response.answers.some((answer) => answer.questionId === question.questionId),
    ).length;

    return {
      questionId: question.questionId,
      text: question.text,
      answeredCount: answered,
      skipCount: Math.max(0, responses.length - answered),
    };
  });

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
