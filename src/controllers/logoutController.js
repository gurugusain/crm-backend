import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function logoutCurrent(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(200).json({ message: "Already logged out" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
      return res.status(200).json({ message: "Logged out" });
    }

    const user = await User.findById(payload.sub).select("+refreshTokens");
    if (user?.refreshTokens?.length) {
      // remove only the matching device token
      const remaining = [];
      for (const rt of user.refreshTokens) {
        const match = await bcrypt.compare(token, rt.tokenHash);
        if (!match) remaining.push(rt);
      }
      user.refreshTokens = remaining;
      await user.save();
    }

    res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
    return res.status(200).json({ message: "Logged out from this device" });
  } catch (err) {
    next(err);
  }
}

export async function logoutAll(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(200).json({ message: "Already logged out" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
      return res.status(200).json({ message: "Logged out" });
    }

    await User.findByIdAndUpdate(payload.sub, { $set: { refreshTokens: [] } });

    res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
    return res.status(200).json({ message: "Logged out from all devices" });
  } catch (err) {
    next(err);
  }
}
