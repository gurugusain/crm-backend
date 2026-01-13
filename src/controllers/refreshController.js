import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // 1) Verify refresh token signature
    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // 2) Load user + refreshTokens array (hashed tokens)
    const user = await User.findById(payload.sub).select(
      "+refreshTokens +role"
    );
    if (!user || !user.refreshTokens || user.refreshTokens.length === 0) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // 3) Find matching token hash (token rotation check)
    let matchedIndex = -1;

    for (let i = 0; i < user.refreshTokens.length; i++) {
      const entry = user.refreshTokens[i];

      // ✅ IMPORTANT safety check
      if (!entry || !entry.tokenHash) continue;

      const ok = await bcrypt.compare(token, entry.tokenHash);
      if (ok) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      res.clearCookie("refreshToken", {
        path: "/api/v1/auth/refresh",
      });

      return res.status(401).json({
        message: "Invalid refresh token, please login again",
      });
    }

    // 4) Rotate: remove old token, add new token
    user.refreshTokens.splice(matchedIndex, 1);

    const newAccessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
    });

    const newHash = await bcrypt.hash(newRefreshToken, 12);
    user.refreshTokens.push({ tokenHash: newHash });
    await user.save();

    // 5) Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/api/v1/auth/refresh",
    });

    return res
      .status(200)
      .json({
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
}
