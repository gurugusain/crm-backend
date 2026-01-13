import DealTask from "../models/DealTask.js";

export async function listDealTasks(req, res, next) {
  try {
    const { dealId } = req.params;

    const tasks = await DealTask.find({ deal: dealId })
      .sort({ createdAt: -1 })
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role");

    return res.status(200).json({ data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function createDealTask(req, res, next) {
  try {
    const { dealId } = req.params;
    const { title, dueDate, priority, assignee } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    const task = await DealTask.create({
      deal: dealId,
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "MEDIUM",
      assignee: assignee || undefined,
      createdBy: req.user.id,
    });

    const populated = await DealTask.findById(task._id)
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role");

    return res.status(201).json({ data: populated });
  } catch (err) {
    next(err);
  }
}

export async function updateDealTask(req, res, next) {
  try {
    const { dealId, taskId } = req.params;

    const allowed = ["title", "dueDate", "status", "priority", "assignee"];
    const update = {};

    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    if (update.title) update.title = update.title.trim();
    if (update.dueDate) update.dueDate = new Date(update.dueDate);

    const task = await DealTask.findOneAndUpdate(
      { _id: taskId, deal: dealId },
      update,
      { new: true, runValidators: true }
    )
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.status(200).json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteDealTask(req, res, next) {
  try {
    const { dealId, taskId } = req.params;

    const task = await DealTask.findOne({ _id: taskId, deal: dealId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    return res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listAllTasks(req, res, next) {
  try {
    const status = req.query.status; // OPEN/DONE
    const assignee = req.query.assignee; // userId
    const dueFrom = req.query.dueFrom; // ISO date
    const dueTo = req.query.dueTo; // ISO date
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);

    const filter = {};
    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;

    if (dueFrom || dueTo) {
      filter.dueDate = {};
      if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
      if (dueTo) filter.dueDate.$lte = new Date(dueTo);
    }

    const tasks = await DealTask.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit)
      .populate("deal", "name title")
      .populate("assignee", "name email role")
      .populate("createdBy", "name email role");

    return res.status(200).json({ results: tasks });
  } catch (err) {
    next(err);
  }
}

