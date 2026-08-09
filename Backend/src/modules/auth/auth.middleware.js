// Authentication middleware: verifies the request carries a valid Better Auth
// session (via cookies/Authorization header) and attaches the logged-in user
// to the request. Route handlers can then rely on req.user being defined.

import ApiError from "../../common/utils/api-error.js";
import { auth } from "../../common/config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const authenticate = async (req, res, next) => {
  try {
    // Convert Node req.headers into the format Better Auth expects,
    // then ask it to resolve the current session.
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      throw ApiError.unauthorized("Authentication is required");
    }

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
