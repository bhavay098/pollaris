import ApiError from "../../common/utils/api-error.js";
import { auth } from "../../common/config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const authenticate = async (req, res, next) => {
  try {
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
