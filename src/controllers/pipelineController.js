import Deal from "../models/Deal.js";

export async function pipelineSummary(req, res, next) {
  try {
    const { owner, from, to } = req.query;

    const match = {};

    // Optional owner filter
    if (owner) match.owner = owner;

    // Optional date range filter (createdAt)
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const data = await Deal.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert to nice response format
    const result = {};
    for (const row of data) {
      result[row._id] = { count: row.count, totalAmount: row.totalAmount };
    }

    return res.status(200).json({
      filters: { owner: owner || null, from: from || null, to: to || null },
      stages: result,
    });
  } catch (err) {
    next(err);
  }
}
