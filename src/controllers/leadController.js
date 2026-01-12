import Lead from "../models/Lead.js";

export async function createLead(req, res, next) {
  try {
    const { firstName, lastName, company, email, phone, status } = req.body;

    const lead = await Lead.create({
      firstName,
      lastName,
      company,
      email,
      phone,
      status,
      owner: req.user.id, // ownership from access token
    });

    return res.status(201).json({ message: "Lead created", lead });
  } catch (err) {
    next(err);
  }
}

export async function listLeads(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const search = (req.query.search || "").trim();

    const filter = { isDeleted: false };

    // Simple search across name/company/email/phone
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("owner", "name email role");

    return res.status(200).json({
      page,
      limit,
      total,
      results: leads,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateLead(req, res, next) {
  try {
    const lead = req.lead;

    const allowedFields = ["firstName", "lastName", "company", "email", "phone", "status"];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) lead[key] = req.body[key];
    }

    await lead.save();
    return res.status(200).json({ message: "Lead updated", lead });
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(req, res, next) {
  try {
    const lead = req.lead;
    lead.isDeleted = true; // soft delete
    await lead.save();

    return res.status(200).json({ message: "Lead deleted" });
  } catch (err) {
    next(err);
  }
}

export async function getLeadById(req, res, next) {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("owner", "name email role");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Optional: computed full name for frontend convenience
    const result = lead.toObject();
    result.name = [result.firstName, result.lastName].filter(Boolean).join(" ");

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


