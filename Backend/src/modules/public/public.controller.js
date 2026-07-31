import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api-response.js";
import Poll from "../polls/poll.model.js";
import Response from "../polls/response.model.js";
import { ensurePollActive, formatPublicPoll, hashRespondent } from "../shared/poll.helpers.js";
import {
  buildPublicQuestionResults,
  buildQuestionWiseOptionCounts,
} from "../shared/poll.analytics.js";
import { getIO } from "../../common/config/socket.js";

const validateSubmission = (poll, answers = []) => {
  if (!Array.isArray(answers) || answers.length < 1) {
    throw ApiError.badRequest("At least one answer is required");
  }

  const answerMap = new Map();
  answers.forEach((answer) => {
    if (!answer?.questionId || !answer?.selectedOptionId) {
      throw ApiError.badRequest("Each answer must include questionId and selectedOptionId");
    }

    if (answerMap.has(answer.questionId)) {
      throw ApiError.badRequest("Only one answer per question is allowed");
    }

    answerMap.set(answer.questionId, answer.selectedOptionId);
  });

  for (const question of poll.questions) {
    const selectedOptionId = answerMap.get(question.questionId);

    if (question.isRequired && !selectedOptionId) {
      throw ApiError.badRequest(`Required question not answered: ${question.text}`);
    }

    if (selectedOptionId) {
      const validOption = question.options.some((option) => option.optionId === selectedOptionId);
      if (!validOption) {
        throw ApiError.badRequest(`Invalid option selected for question: ${question.text}`);
      }
    }
  }
};

const getPublicPollBySlug = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug }).lean();

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const isExpired = new Date() > new Date(poll.expiresAt);

    return ApiResponse.ok(res, "Public poll fetched", {
      poll: formatPublicPoll(poll),
      isExpired,
    });
  } catch (error) {
    next(error);
  }
};

const submitPublicResponse = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug });

    const state = ensurePollActive(poll);
    if (!state.ok) {
      return res.status(state.code).json({ success: false, message: state.message });
    }

    if (poll.responseMode === "AUTHENTICATED" && !req.user) {
      throw ApiError.unauthorized("Login is required to submit this poll");
    }

    validateSubmission(poll, req.body.answers);

    const payload = {
      pollId: poll._id,
      answers: req.body.answers,
      respondentType: req.user ? "AUTH" : "ANON",
    };

    if (req.user) {
      payload.respondentUserId = req.user._id;
    } else {
      payload.respondentHash = hashRespondent(req);
    }

    try {
      await Response.create(payload);
    } catch (error) {
      if (error?.code === 11000) {
        throw ApiError.conflict("You have already submitted this poll");
      }
      throw error;
    }

    const [totalResponses, responses] = await Promise.all([
      Response.countDocuments({ pollId: poll._id }),
      Response.find({ pollId: poll._id }).lean(),
    ]);

    const questionWise = buildQuestionWiseOptionCounts(poll.questions, responses);

    const io = getIO();
    io.to(`poll:owner:${poll._id}`).emit("analytics:response_received", {
      pollId: String(poll._id),
      totalResponses,
    });
    io.to(`poll:owner:${poll._id}`).emit("analytics:question_updated", {
      pollId: String(poll._id),
      questionWise,
    });
    if (poll.isPublished) {
      io.to(`poll:public:${poll.slug}`).emit("analytics:response_received", {
        pollId: String(poll._id),
        totalResponses,
      });
      io.to(`poll:public:${poll.slug}`).emit("analytics:question_updated", {
        pollId: String(poll._id),
        questionWise,
      });
    }

    return ApiResponse.created(res, "Response submitted successfully", {
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

const getPublicResults = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug }).lean();

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    if (!poll.isPublished) {
      throw ApiError.forbidden("Poll results are not published yet");
    }

    const responses = await Response.find({ pollId: poll._id }).lean();

    const questionWise = buildPublicQuestionResults(poll.questions, responses);

    return ApiResponse.ok(res, "Published results fetched", {
      poll: {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        slug: poll.slug,
        publishedAt: poll.publishedAt,
      },
      totalResponses: responses.length,
      questionWise,
    });
  } catch (error) {
    next(error);
  }
};

export { getPublicPollBySlug, submitPublicResponse, getPublicResults };
