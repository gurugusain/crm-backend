import DealNote from "../models/dealNote.model.js";

export const listDealNotes = async (req, res) => {
  try {
    const { dealId } = req.params;
    const notes = await DealNote.find({ deal: dealId })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ data: notes });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Failed to load notes" });
  }
};

export const createDealNote = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { body } = req.body;

    if (!body || body.trim().length < 3) {
      return res.status(400).json({ message: "Note body must be at least 3 characters" });
    }

    const note = await DealNote.create({
      deal: dealId,
      body: body.trim(),
      createdBy: req.user?._id, // depends on your auth middleware
    });

    return res.status(201).json({ data: note });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Failed to add note" });
  }
};

export const deleteDealNote = async (req, res) => {
  try {
    const { dealId, noteId } = req.params;

    const note = await DealNote.findOne({ _id: noteId, deal: dealId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    await note.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err?.message || "Failed to delete note" });
  }
};
