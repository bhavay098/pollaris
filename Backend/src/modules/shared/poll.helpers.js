import crypto from "node:crypto";

const generateSlug = () => crypto.randomBytes(6).toString("hex");

const hashRespondent = (req) => {
  const source = `${req.ip || ""}|${req.headers["user-agent"] || ""}`;
  return crypto.createHash("sha256").update(source).digest("hex");
};

const ensurePollActive = (poll) => {
  if (!poll) {
    return { ok: false, code: 404, message: "Poll not found" };
  }

  if (new Date() > new Date(poll.expiresAt)) {
    return { ok: false, code: 410, message: "Poll has expired" };
  }

  return { ok: true };
};

const formatPublicPoll = (poll) => ({
  id: poll._id,
  title: poll.title,
  description: poll.description,
  slug: poll.slug,
  responseMode: poll.responseMode,
  expiresAt: poll.expiresAt,
  isPublished: poll.isPublished,
  publishedAt: poll.publishedAt,
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
