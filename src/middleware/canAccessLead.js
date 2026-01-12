import Lead from "../models/Lead.js";

export async function canAccessLead(req, res, next) {
  try {
    const { id } = req.params;

    const lead = await Lead.findOne({ _id: id, isDeleted: false });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Admin/Manager can access all
    if (req.user.role === "ADMIN" || req.user.role === "MANAGER") {
      req.lead = lead; // attach for controller reuse
      return next();
    }

    // Sales can access only own leads
    if (lead.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed for this lead" });
    }

    req.lead = lead;
    next();
  } catch (err) {
    next(err);
  }
}
