import Account from "../models/Account.js";

export async function createAccount(req, res, next) {
  try {
    const { companyName, gst, industry, parentAccount } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "companyName is required" });
    }

    // If GST present, avoid duplicates (company + gst)
    if (gst) {
      const existing = await Account.findOne({
        companyName: companyName.trim(),
        gst: gst.trim().toUpperCase(),
      });
      if (existing) {
        return res.status(409).json({ message: "Account already exists with same GST" });
      }
    }

    const account = await Account.create({
      companyName: companyName.trim(),
      gst: gst?.trim().toUpperCase(),
      industry,
      parentAccount,
      owner: req.user.id,
    });

    return res.status(201).json({ message: "Account created", account });
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const { id } = req.params;
    const allowed = ["companyName", "gst", "industry", "parentAccount"];

    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (update.gst) update.gst = update.gst.trim().toUpperCase();

    const account = await Account.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({ message: "Account updated", account });
  } catch (err) {
    next(err);
  }
}

export async function listAccounts(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { gst: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Account.countDocuments(filter);

    const accounts = await Account.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner", "name email role")
      .populate("parentAccount", "companyName");

    return res.status(200).json({
      page,
      limit,
      total,
      results: accounts,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAccountById(req, res, next) {
  try {
    const account = await Account.findById(req.params.id)
      .populate("owner", "name email role")
      .populate("parentAccount", "companyName");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json(account);
  } catch (err) {
    next(err);
  }
}
