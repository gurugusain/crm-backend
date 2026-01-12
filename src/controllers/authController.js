import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth/refresh",
};

export async function register(req, res, next) {
  try {
    console.log("Register request body:", req.body);
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      message: "User registered",
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

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+passwordHash +refreshTokenHash"
    );
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });

    // store hashed refresh token (rotation friendly)
    const refreshToken = signRefreshToken({ sub: user._id.toString() });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    user.refreshTokens.push({ tokenHash: refreshTokenHash });
    await user.save();

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      message: "Login success",
      accessToken,
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
