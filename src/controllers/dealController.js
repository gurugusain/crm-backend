import Deal from "../models/Deal.js";
import Account from "../models/Account.js";

export async function createDeal(req, res, next) {
  try {
    const { title, amount = 0, stage = "NEW", accountId, leadId } = req.body;

    // Basic validation
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    const deal = await Deal.create({
      title,
      amount,
      stage,
      account: account._id,
      lead: leadId,
      owner: req.user.id,
    });

    return res.status(201).json({ message: "Deal created", deal });
  } catch (err) {
    next(err);
  }
}

export async function listDeals(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);

    const stage = req.query.stage;
    const owner = req.query.owner; // optional
    const minAmount = req.query.minAmount ? Number(req.query.minAmount) : null;
    const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : null;

    const search = (req.query.search || "").trim();

    const filter = {};

    if (stage) filter.stage = stage;
    if (owner) filter.owner = owner;

    if (minAmount !== null || maxAmount !== null) {
      filter.amount = {};
      if (minAmount !== null) filter.amount.$gte = minAmount;
      if (maxAmount !== null) filter.amount.$lte = maxAmount;
    }

    // Search by deal title (simple + index friendly)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Deal.countDocuments(filter);

    const deals = await Deal.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("account", "companyName gst")
      .populate("owner", "name email role");

    return res.status(200).json({
      page,
      limit,
      total,
      results: deals,
    });
  } catch (err) {
    next(err);
  }
}




export async function getDealById(req, res, next) {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("account", "name gst phone email")
      .populate("owner", "name email role");

    if (!deal) return res.status(404).json({ message: "Deal not found" });

    return res.status(200).json(deal);
  } catch (err) {
    next(err);
  }
}

export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const allowed = ["name", "stage", "amount", "closeDate", "accountId", "description"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // normalize
    if (updates.amount !== undefined) updates.amount = Number(updates.amount);
    if (updates.closeDate === null) updates.closeDate = null;
    if (updates.closeDate) updates.closeDate = new Date(updates.closeDate);

    // account relation field depends on your schema
    // if your deal schema uses `account` not `accountId`
    if (updates.accountId !== undefined) {
      updates.account = updates.accountId || null;
      delete updates.accountId;
    }

    const updated = await Deal.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("account", "name");

    if (!updated) return res.status(404).json({ message: "Deal not found" });

    return res.json({ data: updated });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Failed to update deal" });
  }
};

