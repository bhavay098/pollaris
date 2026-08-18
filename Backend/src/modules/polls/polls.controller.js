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
import { withPollLock } from "../shared/poll-lock.js";

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

// Helper to escape special regex characters in search queries
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /polls/mine — list the current user's polls with search, filtering, sorting, pagination, and live response counts.
const getMyPolls = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.toLowerCase().trim() : "all";
    const sort = typeof req.query.sort === "string" ? req.query.sort.toLowerCase().trim() : "newest";

    // Determine status filter condition
    let statusMatch = null;
    if (status === "active") {
      statusMatch = { isPublished: true, isExpired: false };
    } else if (status === "draft") {
      statusMatch = { isPublished: false };
    } else if (status === "expired") {
      statusMatch = { isExpired: true };
    }

    // Determine sort condition
    let sortStage = { createdAt: -1 };
    if (sort === "oldest") {
      sortStage = { createdAt: 1 };
    } else if (sort === "most_votes") {
      sortStage = { totalResponses: -1, createdAt: -1 };
    } else if (sort === "least_votes") {
      sortStage = { totalResponses: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [result] = await Poll.aggregate([
      // Only return polls owned by the requesting user
      { $match: { createdBy: req.user.id } },
      {
        // Join each poll with its responses to count submissions without N+1 queries
        $lookup: {
          from: "responses",
          localField: "_id",
          foreignField: "pollId",
          as: "responses",
        },
      },
      {
        // Shape output fields and compute metrics
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          description: 1,
          slug: 1,
          responseMode: 1,
          expiresAt: 1,
          isPublished: 1,
          resultsPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          totalResponses: { $size: "$responses" },
          isExpired: { $lt: ["$expiresAt", "$$NOW"] },
        },
      },
      {
        $facet: {
          // Overall user stats across all polls (for dashboard counters)
          overview: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isPublished", true] },
                          { $eq: ["$isExpired", false] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                draft: {
                  $sum: {
                    $cond: [{ $eq: ["$isPublished", false] }, 1, 0],
                  },
                },
                expired: {
                  $sum: {
                    $cond: [{ $eq: ["$isExpired", true] }, 1, 0],
                  },
                },
                totalResponses: { $sum: "$totalResponses" },
              },
            },
          ],
          // Count of matching filtered results
          totalMatching: [
            ...(search ? [{ $match: { title: { $regex: escapeRegex(search), $options: "i" } } }] : []),
            ...(statusMatch ? [{ $match: statusMatch }] : []),
            { $count: "count" },
          ],
          // Paginated list of polls
          paginatedPolls: [
            ...(search ? [{ $match: { title: { $regex: escapeRegex(search), $options: "i" } } }] : []),
            ...(statusMatch ? [{ $match: statusMatch }] : []),
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);

    const totalFiltered = result?.totalMatching?.[0]?.count || 0;
    const polls = result?.paginatedPolls || [];
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const overview = result?.overview?.[0] || {
      total: 0,
      active: 0,
      draft: 0,
      expired: 0,
      totalResponses: 0,
    };

    const pagination = {
      totalPolls: totalFiltered,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return ApiResponse.ok(res, "Polls fetched", {
      polls,
      pagination,
      stats: overview,
    });
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
    const existingPoll = await Poll.findOne({
      _id: req.params.pollId,
      createdBy: req.user.id,
    });

    if (!existingPoll) {
      throw ApiError.notFound("Poll not found");
    }

    return await withPollLock(String(existingPoll._id), async () => {
      const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

      if (!poll) {
        throw ApiError.notFound("Poll not found");
      }

      const existingResponses = await Response.countDocuments({ pollId: poll._id });

      // Publishing locks the poll's content — the public may be viewing
      // questions/results, so editing is no longer allowed.
      if (poll.isPublished) {
        throw ApiError.conflict("Poll cannot be edited after publishing");
      }

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
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /polls/:pollId — delete a poll (owner-only) along with all its responses.
const deletePoll = async (req, res, next) => {
  try {
    // findOneAndDelete scopes by the logged-in user, so users can only
    // delete their own polls.
    const poll = await Poll.findOneAndDelete({
      _id: req.params.pollId,
      createdBy: req.user.id,
    });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    // Cascade: remove the poll's responses so no orphaned data is left behind.
    await Response.deleteMany({ pollId: poll._id });

    return ApiResponse.ok(res, "Poll deleted successfully");
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

// POST /polls/:pollId/unpublish — take a live poll back down to draft, hiding
// its results from the public again.
const unpublishPoll = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    if (!poll.isPublished) {
      throw ApiError.conflict("Poll is not published");
    }

    poll.isPublished = false;
    poll.publishedAt = null;
    await poll.save();

    // Mirror the publish broadcast so open dashboards/result pages react.
    const io = getIO();
    io.to(`poll:owner:${poll._id}`).emit("poll:status_changed", {
      pollId: String(poll._id),
      isPublished: false,
      publishedAt: null,
    });
    io.to(`poll:public:${poll.slug}`).emit("poll:status_changed", {
      pollId: String(poll._id),
      isPublished: false,
      publishedAt: null,
    });

    return ApiResponse.ok(res, "Poll unpublished successfully", { poll });
  } catch (error) {
    next(error);
  }
};

// POST /polls/:pollId/publish-results — make the results readout public without
// closing the poll. Respondents who visit after this point see the results view.
const publishResults = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    if (!poll.isPublished) {
      throw ApiError.conflict("Publish the poll before revealing its results");
    }

    if (poll.resultsPublished) {
      throw ApiError.conflict("Results are already published");
    }

    poll.resultsPublished = true;
    await poll.save();

    const io = getIO();
    const payload = { pollId: String(poll._id), resultsPublished: true };
    io.to(`poll:owner:${poll._id}`).emit("poll:status_changed", payload);
    io.to(`poll:public:${poll.slug}`).emit("poll:status_changed", payload);

    return ApiResponse.ok(res, "Results published successfully", { poll });
  } catch (error) {
    next(error);
  }
};

// POST /polls/:pollId/unpublish-results — revert the public page back to the voting form.
const unpublishResults = async (req, res, next) => {
  try {
    const poll = await Poll.findOne({ _id: req.params.pollId, createdBy: req.user.id });

    if (!poll) {
      throw ApiError.notFound("Poll not found");
    }

    if (!poll.resultsPublished) {
      throw ApiError.conflict("Results are not currently published");
    }

    poll.resultsPublished = false;
    await poll.save();

    const io = getIO();
    const payload = { pollId: String(poll._id), resultsPublished: false };
    io.to(`poll:owner:${poll._id}`).emit("poll:status_changed", payload);
    io.to(`poll:public:${poll.slug}`).emit("poll:status_changed", payload);

    return ApiResponse.ok(res, "Results unpublished successfully", { poll });
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
  deletePoll,
  publishPoll,
  unpublishPoll,
  publishResults,
  unpublishResults,
  getAnalyticsSummary,
  getAnalyticsQuestions,
  getAnalyticsParticipation,
};
