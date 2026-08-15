// Public-facing controller: serves polls to respondents by slug, accepts response submissions, and exposes published results. Unlike the owner routes, these are accessed without logging in (optional auth).

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
import { withPollLock } from "../shared/poll-lock.js";

// Validates a response submission against the poll's questions:
// - at least one answer, no duplicate answers for the same question
// - required questions must be answered
// - every selected option must actually exist on the question
const validateSubmission = (poll, answers = []) => {
  if (!Array.isArray(answers) || answers.length < 1) {
    throw ApiError.badRequest("At least one answer is required");
  }

  // Index answers by questionId so we can detect duplicates and look up
  // each question's answer in O(1).
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

  // Verify the submission against every question defined on the poll.
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

// GET /api/public/polls/:slug — fetch a poll for display to respondents.
// Any existing poll is reachable by slug so respondents can answer it; the
// `isPublished` flag only controls whether results are shown (not access).
const getPublicPollBySlug = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug }).lean();

    if (!poll) {
      throw ApiError.notFound("Poll not found");
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

// POST /api/public/polls/:slug/responses — persist a response submission and
// push real-time updates to anyone watching the poll's results.
const submitPublicResponse = async (req, res, next) => {
  try {
    const existingPoll = await Poll.findOne({
      slug: req.params.slug,
    });

    if (!existingPoll) {
      throw ApiError.notFound("Poll not found");
    }

    return await withPollLock(String(existingPoll._id), async () => {
      const poll = await Poll.findOne({
        _id: existingPoll._id,
        slug: req.params.slug,
      });

      if (!poll) {
        throw ApiError.notFound("Poll not found");
      }

      // Reject if the poll is missing or past its expiry.
      const state = ensurePollActive(poll);
      if (!state.ok) {
        if (state.code === 410) {
          throw ApiError.gone(state.message);
        }

        throw ApiError.notFound(state.message);
      }

      // AUTHENTICATED polls require a signed-in respondent.
      if (poll.responseMode === "AUTHENTICATED" && !req.user) {
        throw ApiError.unauthorized("Login is required to submit this poll");
      }

      validateSubmission(poll, req.body?.answers);

      const payload = {
        pollId: poll._id,
        answers: req.body.answers,
        respondentType: req.user ? "AUTH" : "ANON",
      };

      // Identify the respondent by userId (signed-in) or by a stable hash of
      // IP + user-agent (anonymous) so duplicate submissions can be caught.
      if (req.user) {
        payload.respondentUserId = req.user.id;
      } else {
        payload.respondentHash = hashRespondent(req);
      }

      try {
        await Response.create(payload);
      } catch (error) {
        // Mongo duplicate-key error (11000) means this respondent already
        // submitted — the unique indexes in response.model.js enforce it.
        if (error?.code === 11000) {
          throw ApiError.conflict("You have already submitted this poll");
        }
        throw error;
      }

      // Fetch fresh counts/analytics in parallel, then broadcast them.
      const [totalResponses, responses] = await Promise.all([
        Response.countDocuments({ pollId: poll._id }),
        Response.find({ pollId: poll._id }).lean(),
      ]);

      const questionWise = buildQuestionWiseOptionCounts(poll.questions, responses);

      // Always notify the owner's dashboard room...
      const io = getIO();
      io.to(`poll:owner:${poll._id}`).emit("analytics:response_received", {
        pollId: String(poll._id),
        totalResponses,
      });
      io.to(`poll:owner:${poll._id}`).emit("analytics:question_updated", {
        pollId: String(poll._id),
        questionWise,
      });
      // ...and the public results room too, but only if results are live.
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
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/public/polls/:slug/results — public result view (only once published).
const getPublicResults = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ slug: req.params.slug }).lean();

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    // Results stay hidden until the poll owner publishes the poll.
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
