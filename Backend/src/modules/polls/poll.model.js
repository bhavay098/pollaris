import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    optionId: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: "Each question must have at least 2 options",
      },
    },
  },
  { _id: false },
);

const pollSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    responseMode: {
      type: String,
      enum: ["ANONYMOUS", "AUTHENTICATED"],
      default: "ANONYMOUS",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) =>
          Array.isArray(questions) && questions.length >= 1,
        message: "Poll must have at least one question",
      },
    },
  },
  { timestamps: true },
);

pollSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Poll", pollSchema);
