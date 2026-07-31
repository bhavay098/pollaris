import mongoose from "mongoose";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    respondentHash: {
      type: String,
      default: null,
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

responseSchema.index({ pollId: 1, submittedAt: -1 });
responseSchema.index({ pollId: 1, respondentUserId: 1 }, { unique: true, sparse: true });
responseSchema.index({ pollId: 1, respondentHash: 1 }, { unique: true, sparse: true });

export default mongoose.model("Response", responseSchema);
