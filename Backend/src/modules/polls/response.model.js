import mongoose from "mongoose";

// One answer within a submitted response: which question was answered and
// which option was picked. Stored as a plain object (no _id) to keep
// response documents lean.
const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    selectedOptionId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

// A single submission to a poll. The respondent is identified in one of two
// mutually exclusive ways:
//   - respondentUserId for authenticated users, or
//   - respondentHash for anonymous users (hashed IP + user-agent)
const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      index: true,
    },
    respondentType: {
      type: String,
      enum: ["ANON", "AUTH"],
      required: true,
    },
    respondentUserId: {
      type: String,
    },
    respondentHash: {
      type: String,
    },
    answers: {
      type: [answerSchema],
      required: true,
      validate: {
        validator: (answers) => Array.isArray(answers) && answers.length >= 1,
        message: "At least one answer is required",
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

// Fetch a poll's responses newest-first (e.g. for live dashboards).
responseSchema.index({ pollId: 1, submittedAt: -1 });
// Enforce "one response per authenticated user" — sparse so documents
// without a userId don't collide.
responseSchema.index(
  { pollId: 1, respondentUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { respondentUserId: { $type: "string" } },
  },
);
// Same idea for anonymous respondents: one response per hash per poll.
responseSchema.index(
  { pollId: 1, respondentHash: 1 },
  {
    unique: true,
    partialFilterExpression: { respondentHash: { $type: "string" } },
  },
);

export default mongoose.model("Response", responseSchema);
