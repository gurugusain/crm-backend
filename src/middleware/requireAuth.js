import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach user identity for next middlewares/controllers
    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}
