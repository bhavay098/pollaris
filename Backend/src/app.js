import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import cookieParser from "cookie-parser";
import pollsRoutes from "./modules/polls/polls.routes.js";
import publicRoutes from "./modules/public/public.routes.js";
import ApiError from "./common/utils/api-error.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollsRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use((req, _res, next) => {
  next(ApiError.notfound("Route not found"));
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
