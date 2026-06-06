import Habit from "../models/Habit.js";

// GET /api/habits — list all habits for the current user
export async function getHabits(req, res) {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (err) {
    console.error("getHabits error:", err);
    res.status(500).json({ detail: "Failed to fetch habits." });
  }
}

// POST /api/habits — create a new habit
export async function createHabit(req, res) {
  try {
    const { text, pillar, createdAfterEditCutoff } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ detail: "Habit text is required." });
    }
    const habit = await Habit.create({
      userId: req.user._id,
      text: text.trim(),
      pillar: pillar || "General",
      createdAfterEditCutoff: createdAfterEditCutoff || false,
    });
    res.status(201).json(habit);
  } catch (err) {
    console.error("createHabit error:", err);
    res.status(500).json({ detail: "Failed to create habit." });
  }
}

// PUT /api/habits/:id — update a habit
export async function updateHabit(req, res) {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ detail: "Habit not found." });
    res.json(habit);
  } catch (err) {
    console.error("updateHabit error:", err);
    res.status(500).json({ detail: "Failed to update habit." });
  }
}

// DELETE /api/habits/:id — delete a habit
export async function deleteHabit(req, res) {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!habit) return res.status(404).json({ detail: "Habit not found." });
    res.status(204).end();
  } catch (err) {
    console.error("deleteHabit error:", err);
    res.status(500).json({ detail: "Failed to delete habit." });
  }
}
