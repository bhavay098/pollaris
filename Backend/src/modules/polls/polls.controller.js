// Controller layer for poll endpoints: parses the request, calls the model/services, and sends a standardized response. Errors are forwarded to the Express error-handling middleware via next(error).

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

// POST /polls — create a new poll owned by the authenticated user.
const createPoll = async (req, res, next) => {
  try {
    // Validate and normalize raw input up front so the model only receives clean, shape-checked data.
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

// GET /polls/mine — list the current user's polls with a live response count.
const getMyPolls = async (req, res, next) => {
  try {
    const polls = await Poll.aggregate([
      // Only return polls owned by the requesting user.
      { $match: { createdBy: req.user.id } },
      // Newest polls first.
      { $sort: { createdAt: -1 } },
      {
        // Join each poll with its response documents so we can count them without a separate query per poll (avoids an N+1 problem).
        $lookup: {
          from: "responses",
          localField: "_id",
          foreignField: "pollId",
          as: "responses",
        },
      },
      {
        // Shape the output: expose a friendly `id` field and computed metrics instead of the raw responses array.
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

// GET /polls/:pollId — fetch a single poll (owner-only) plus response count.
const getPollById = async (req, res, next) => {
  try {
    // findOne scopes by the logged-in user, so users can only fetch their own polls.
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
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

// PATCH /polls/:pollId — edit poll details, blocked once responses exist.
const updatePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    const existingResponses = await Response.countDocuments({ pollId: poll._id });

    // Editing after responses would corrupt the analytics, so disallow it.
    if (existingResponses > 0) {
      throw ApiError.conflict("Poll cannot be edited after receiving responses");
    }

    // Re-validate input and overwrite the editable fields in place.
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

// POST /polls/:pollId/publish — mark a poll as live and notify subscribers.
const publishPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    if (poll.isPublished) {
      throw ApiError.conflict("Poll is already published");
    }

    poll.isPublished = true;
    poll.publishedAt = new Date();
    await poll.save();

    // Broadcast the new status over Socket.IO to everyone watching this poll:
    // the owner's dashboard room and the public viewer room keyed by slug.
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

// GET /polls/:pollId/analytics/summary — high-level participation stats.
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    // .lean() returns plain objects (faster, no Mongoose document overhead)
    // since these responses are only read, never mutated.
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

// GET /polls/:pollId/analytics/questions — per-question result breakdown.
const getAnalyticsQuestions = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id }).lean();

    if (!poll) {
      throw ApiError.notFound("Poll not found");
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

// GET /polls/:pollId/analytics/participation — insights on who/how participated.
const getAnalyticsParticipation = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id }).lean();

    if (!poll) {
      throw ApiError.notFound("Poll not found");
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
