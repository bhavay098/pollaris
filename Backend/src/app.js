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

// Enable CORS for the frontend origin and allow credentials (cookies) to be sent.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Set up rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", 
  legacyHeaders: false, 
  message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20, // Limit each IP to 20 auth requests per hour
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
});

// Apply global rate limiter
app.use(globalLimiter);

// Better Auth must receive the raw request body before Express parses JSON.
app.use("/api/auth", authLimiter);
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
