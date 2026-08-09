import mongoose from "mongoose";

// A single answer choice within a question (e.g. "Yes", "No", "Maybe").
// Uses a client-generated `optionId` rather than Mongo's _id to keep
// the embedded document lightweight and to allow stable references
// from the frontend even before the poll is saved.
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
  { _id: false }, // Prevent Mongo from adding a separate _id on each option
);

// A single question inside a poll. Each question carries its own list
// of options and can optionally be marked optional for the respondent.
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
      default: true, // By default every question must be answered
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: "Each question must have at least 2 options",
      },
    },
  },
  { _id: false }, // Prevent Mongo from adding a separate _id on each question
);

// Root schema for a poll. A poll belongs to a creator, contains at least
// one question, and goes through a publish lifecycle (draft → published).
const pollSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      required: true,
      index: true, // Indexed for "find all polls by this user" queries
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
      default: "", // Optional; empty string when not provided
    },
    slug: {
      type: String,
      required: true,
      unique: true, // URL-friendly public identifier; no duplicates allowed
      index: true,  // Used heavily for public-facing lookups
    },
    responseMode: {
      type: String,
      enum: ["ANONYMOUS", "AUTHENTICATED"],
      default: "ANONYMOUS",
      // ANONYMOUS  → anyone can respond without logging in
      // AUTHENTICATED → only signed-in users can respond
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // Queried frequently to find/purge expired polls
    },
    isPublished: {
      type: Boolean,
      default: false, // Drafts are not visible to the public until published
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null, // Populated at the moment of first publish
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
  { timestamps: true }, // Automatically adds createdAt and updatedAt fields
);

// Compound index: efficiently fetch a user's polls sorted newest-first
// (e.g. "list my polls" dashboard query).
pollSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Poll", pollSchema);
