import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import {
  createPoll,
  getMyPolls,
  getPollById,
  updatePoll,
  publishPoll,
  getAnalyticsSummary,
  getAnalyticsQuestions,
  getAnalyticsParticipation,
} from "./polls.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createPoll);
router.get("/mine", getMyPolls);
router.get("/:pollId", getPollById);
router.patch("/:pollId", updatePoll);
router.post("/:pollId/publish", publishPoll);

router.get("/:pollId/analytics/summary", getAnalyticsSummary);
router.get("/:pollId/analytics/questions", getAnalyticsQuestions);
router.get("/:pollId/analytics/participation", getAnalyticsParticipation);

export default router;
