// Express application entry point: wires up middleware, mounts the route
// modules, and defines the global error handler.

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./common/config/auth.js";
import { rateLimit } from "express-rate-limit";
import pollsRoutes from "./modules/polls/polls.routes.js";
import publicRoutes from "./modules/public/public.routes.js";
import ApiError from "./common/utils/api-error.js";

const app = express();

// Helper to format second durations into user-friendly text (e.g. "45 seconds", "15 minutes")
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "a moment";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const mins = Math.ceil(seconds / 60);
  return `${mins} minute${mins === 1 ? "" : "s"}`;
};

// Factory for rate limiter response handlers that include retryAfter in seconds and a clear message
const createRateLimitHandler = (prefix) => (req, res, _next, options) => {
  const retryAfterHeader = res.getHeader("Retry-After");
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : Math.ceil(options.windowMs / 1000);
  const formatted = formatDuration(retryAfter);
  const message = `${prefix || "Too many requests"}. Please wait ${formatted} before trying again.`;

  res.status(options.statusCode || 429).json({
    success: false,
    isRateLimited: true,
    retryAfter,
    message,
  });
};

// Enable CORS for the frontend origin, allow credentials, and expose rate limit headers.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Retry-After", "RateLimit-Reset", "RateLimit-Limit", "RateLimit-Remaining"],
  }),
);

// Set up rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many requests from your IP"),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit auth attempts to 50 per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many authentication attempts"),
});

// Apply global rate limiter
app.use(globalLimiter);

// Better Auth must receive the raw request body before Express parses JSON.
app.use("/api/auth", authLimiter);
app.use("/api/auth", (req, _res, next) => {
  if (req.url === "/forget-password" || req.url.startsWith("/forget-password?")) {
    req.url = req.url.replace("/forget-password", "/request-password-reset");
  }
  next();
});
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// Mount feature routers on their API prefixes.
app.use("/api/polls", pollsRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Catch-all: any route that doesn't match is turned into a 404 error.
app.use((req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Global error handler: logs server errors, sends a consistent JSON shape
// for everything else, and never leaks stack traces to the client.
app.use((err, _req, res, _next) => {
  const statusCode =
    err.statusCode ||
    err.status ||
    (err.type === "entity.parse.failed" ? 400 : null) ||
    (err.name === "ValidationError" || err.name === "CastError" ? 400 : null) ||
    (err.code === 11000 ? 409 : null) ||
    500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    success: false,
    message: isServerError ? "Internal server error" : err.message || "Request failed",
  });
});

export default app;
