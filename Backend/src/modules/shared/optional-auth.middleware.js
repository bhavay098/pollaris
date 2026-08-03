import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../common/config/auth.js";

const authenticateOptional = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.user = session?.user || null;
  } catch {
    req.user = null;
  }

  next();
};

export default authenticateOptional;
