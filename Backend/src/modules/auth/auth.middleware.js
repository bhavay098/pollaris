import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

import User from "./user.model.js";

import ApiError from "../../common/utils/api-error.js";

const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw ApiError.unauthorized("Access token required");
  }

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  req.user = user;

  next();
};

export default authenticate;
