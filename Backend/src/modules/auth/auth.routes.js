import { Router } from "express";

import {
  register,
  login,
  logout,
  refreshAccessToken,
  getMe,
} from "./auth.controller.js";

import authenticate from "./auth.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshAccessToken);

router.get("/me", authenticate, getMe);

export default router;
