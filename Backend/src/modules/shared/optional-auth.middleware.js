import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from "../auth/user.model.js";

const authenticateOptional = async (req, _res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

export default authenticateOptional;
