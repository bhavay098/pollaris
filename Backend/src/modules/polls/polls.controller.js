import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api-response.js";
import Poll from "./poll.model.js";
import Response from "./response.model.js";
import { generateSlug } from "../shared/poll.helpers.js";
import { validateAndNormalizePollInput } from "../shared/poll.validation.js";
import {
  buildParticipantBreakdown,
  buildParticipationInsights,
  buildQuestionAnalytics,
} from "../shared/poll.analytics.js";
import { getIO } from "../../common/config/socket.js";

const createPoll = async (req, res, next) => {
  try {
    const sanitized = validateAndNormalizePollInput(req.body);

    const poll = await Poll.create({
      createdBy: req.user.id,
      title: sanitized.title,
      description: sanitized.description,
      slug: generateSlug(),
      responseMode: sanitized.responseMode,
      expiresAt: sanitized.expiresAt,
      questions: sanitized.questions,
    });

    return ApiResponse.created(res, "Poll created successfully", { poll });
  } catch (error) {
    next(error);
  }
};

const getMyPolls = async (req, res, next) => {
  try {
    const polls = await Poll.aggregate([
      { $match: { createdBy: req.user.id } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "responses",
          localField: "_id",
          foreignField: "pollId",
          as: "responses",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          slug: 1,
          responseMode: 1,
          expiresAt: 1,
          isPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          totalResponses: { $size: "$responses" },
          isExpired: { $lt: ["$expiresAt", "$$NOW"] },
        },
      },
    ]);

    return ApiResponse.ok(res, "Polls fetched", { polls });
  } catch (error) {
    next(error);
  }
};

const getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const totalResponses = await Response.countDocuments({ pollId: poll._id });

    return ApiResponse.ok(res, "Poll fetched", {
      poll,
      totalResponses,
      isExpired: new Date() > new Date(poll.expiresAt),
    });
  } catch (error) {
    next(error);
  }
};

const updatePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const existingResponses = await Response.countDocuments({ pollId: poll._id });

    if (existingResponses > 0) {
      throw ApiError.conflict("Poll cannot be edited after receiving responses");
    }

    const sanitized = validateAndNormalizePollInput(req.body);
    poll.title = sanitized.title;
    poll.description = sanitized.description;
    poll.responseMode = sanitized.responseMode;
    poll.expiresAt = sanitized.expiresAt;
    poll.questions = sanitized.questions;

    await poll.save();

    return ApiResponse.ok(res, "Poll updated successfully", { poll });
  } catch (error) {
    next(error);
  }
};

const publishPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    if (poll.isPublished) {
      throw ApiError.conflict("Poll is already published");
    }

    poll.isPublished = true;
    poll.publishedAt = new Date();
    await poll.save();

    const io = getIO();
    io.to(`poll:owner:${poll._id}`).emit("poll:status_changed", {
      pollId: String(poll._id),
      isPublished: true,
      publishedAt: poll.publishedAt,
    });
    io.to(`poll:public:${poll.slug}`).emit("poll:status_changed", {
      pollId: String(poll._id),
      isPublished: true,
      publishedAt: poll.publishedAt,
    });

    return ApiResponse.ok(res, "Poll published successfully", { poll });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const responses = await Response.find({ pollId: poll._id }).lean();
    const totalResponses = responses.length;
    const isExpired = new Date() > new Date(poll.expiresAt);

    const participantBreakdown = buildParticipantBreakdown(responses);

    return ApiResponse.ok(res, "Analytics summary fetched", {
      pollId: poll._id,
      totalResponses,
      isExpired,
      isPublished: poll.isPublished,
      participantBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsQuestions = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id }).lean();

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const responses = await Response.find({ pollId: poll._id }).lean();

    const questionWise = buildQuestionAnalytics(poll.questions, responses);

    return ApiResponse.ok(res, "Question analytics fetched", {
      pollId: poll._id,
      questionWise,
      totalResponses: responses.length,
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsParticipation = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id }).lean();

    if (!poll) {
      throw ApiError.notfound("Poll not found");
    }

    const responses = await Response.find({ pollId: poll._id }).lean();

    const insights = buildParticipationInsights(poll.questions, responses);

    return ApiResponse.ok(res, "Participation insights fetched", {
      pollId: poll._id,
      totalResponses: responses.length,
      insights,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createPoll,
  getMyPolls,
  getPollById,
  updatePoll,
  publishPoll,
  getAnalyticsSummary,
  getAnalyticsQuestions,
  getAnalyticsParticipation,
};
