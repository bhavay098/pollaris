// Small, dependency-free helpers shared by the poll and public modules.

import crypto from "node:crypto";

// Generates a random URL-friendly identifier for a poll. 6 random bytes →
// 12 hex chars, collision-resistant enough for user-facing slugs.
const generateSlug = () => crypto.randomBytes(6).toString("hex");

// Produces a stable, non-reversible identifier for an anonymous respondent
// by hashing their IP + user-agent. Two submissions from the same person
// yield the same hash (used to dedupe responses without storing raw IPs).
const hashRespondent = (req) => {
  const source = `${req.ip || ""}|${req.headers["user-agent"] || ""}`;
  return crypto.createHash("sha256").update(source).digest("hex");
};

// Checks a poll can still accept responses. Returns an error descriptor
// (ok: false + HTTP code/message) instead of throwing, so the caller decides how to respond.
const ensurePollActive = (poll) => {
  if (!poll) {
    return { ok: false, code: 404, message: "Poll not found" };
  }

  if (!poll.isPublished) {
    return { ok: false, code: 403, message: "This poll is not yet published" };
  }

  if (new Date() > new Date(poll.expiresAt)) {
    return { ok: false, code: 410, message: "Poll has expired" };
  }

  return { ok: true };
};

// Builds the public-facing JSON shape of a poll: flattens Mongo's _id to a
// friendly `id` and strips fields respondents shouldn't see (owner info).
const formatPublicPoll = (poll) => ({
  id: poll._id,
  title: poll.title,
  description: poll.description,
  slug: poll.slug,
  responseMode: poll.responseMode,
  expiresAt: poll.expiresAt,
  isPublished: poll.isPublished,
  publishedAt: poll.publishedAt,
  resultsPublished: poll.resultsPublished,
  // Exposed so the frontend can detect when a logged-in user is the creator
  // and show the appropriate blocked-voter UI without an extra round-trip.
  createdBy: poll.createdBy,
  questions: poll.questions.map((q) => ({
    questionId: q.questionId,
    text: q.text,
    isRequired: q.isRequired,
    options: q.options.map((opt) => ({
      optionId: opt.optionId,
      text: opt.text,
    })),
  })),
});

export { generateSlug, hashRespondent, ensurePollActive, formatPublicPoll };
