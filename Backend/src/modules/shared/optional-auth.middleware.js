// Optional-auth middleware: same session lookup as `authenticate`, but it
// never rejects the request. Sets req.user to the session user when present
// and to null otherwise, so routes like public poll submission can serve
// both anonymous and signed-in respondents.

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../common/config/auth.js";

const authenticateOptional = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.user = session?.user || null;
  } catch {
    // Invalid/missing session is not an error here — treat as anonymous.
    req.user = null;
  }

  next();
};

export default authenticateOptional;
