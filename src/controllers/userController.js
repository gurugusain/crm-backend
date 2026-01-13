import User from "../models/User.js";

export async function listUsers(req, res, next) {
  try {
    const search = (req.query.search || "").trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("_id name email role")
      .sort({ name: 1 })
      .limit(limit);

    return res.status(200).json({ results: users });
  } catch (err) {
    next(err);
  }
}
