// Public (no-owner) routes: anyone can view a poll by slug and see results.
// Submitting a response uses optional auth so anonymous respondents work too.

import { Router } from "express";
import authenticateOptional from "../shared/optional-auth.middleware.js";
import {
  getPublicPollBySlug,
  submitPublicResponse,
  getPublicResults,
} from "./public.controller.js";

const router = Router();

router.get("/polls/:slug", getPublicPollBySlug);
router.post("/polls/:slug/responses", authenticateOptional, submitPublicResponse);
router.get("/polls/:slug/results", getPublicResults);

export default router;
