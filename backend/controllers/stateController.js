import UserState from "../models/UserState.js";
import Habit from "../models/Habit.js";
import Event from "../models/Event.js";

// GET /api/stats — get streak stats and active pillar
export async function getStats(req, res) {
  try {
    let state = await UserState.findOne({ userId: req.user._id });
    if (!state) {
      state = await UserState.create({ userId: req.user._id });
    }
    res.json(state);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ detail: "Failed to fetch stats." });
  }
}

// PUT /api/stats — update stats (e.g., change active pillar)
export async function updateStats(req, res) {
  try {
    const state = await UserState.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(state);
  } catch (err) {
    console.error("updateStats error:", err);
    res.status(500).json({ detail: "Failed to update stats." });
  }
}

/** Evaluate a streak counter — increment on success, reset on failure */
function evalStreak(stats, isSuccessful) {
  if (isSuccessful) {
    stats.current += 1;
    stats.best = Math.max(stats.best, stats.current);
  } else {
    stats.prev = stats.current;
    stats.current = 0;
  }
}

// POST /api/stats/midnight — process midnight reset
export async function midnightReset(req, res) {
  try {
    const userId = req.user._id;
    const habits = await Habit.find({ userId });
    let state = await UserState.findOne({ userId });
    if (!state) state = await UserState.create({ userId });

    // Evaluate streaks based on completion
    const iron = habits.filter((h) => h.pillar === "Iron");
    const mind = habits.filter((h) => h.pillar === "Mind");
    const general = habits.filter((h) => h.pillar === "General");

    if (habits.length) {
      evalStreak(state.statsMaster, habits.every((h) => h.done));
    }
    if (iron.length) evalStreak(state.statsIron, iron.every((h) => h.done));
    if (mind.length) evalStreak(state.statsMind, mind.every((h) => h.done));
    if (general.length) evalStreak(state.statsGeneral, general.every((h) => h.done));

    await state.save();

    // Reset all habits to undone
    await Habit.updateMany({ userId }, { $set: { done: false } });

    // Archive completed events
    const today = new Date().toISOString().slice(0, 10);
    await Event.updateMany(
      { userId, done: true, isArchived: false },
      { $set: { isArchived: true, doneDate: today } }
    );

    // Return updated state
    const updatedState = await UserState.findOne({ userId });
    res.json(updatedState);
  } catch (err) {
    console.error("midnightReset error:", err);
    res.status(500).json({ detail: "Failed to process midnight reset." });
  }
}

// DELETE /api/stats — full forge reset (clear habits, events, streaks)
export async function resetForge(req, res) {
  try {
    const userId = req.user._id;

    // Delete all user habits and events (keep notes)
    await Habit.deleteMany({ userId });
    await Event.deleteMany({ userId });

    // Reset streaks
    await UserState.findOneAndUpdate(
      { userId },
      {
        $set: {
          activePillar: "General",
          statsMaster: { current: 0, prev: 0, best: 0 },
          statsIron: { current: 0, prev: 0, best: 0 },
          statsMind: { current: 0, prev: 0, best: 0 },
          statsGeneral: { current: 0, prev: 0, best: 0 },
        },
      },
      { upsert: true }
    );

    res.status(204).end();
  } catch (err) {
    console.error("resetForge error:", err);
    res.status(500).json({ detail: "Failed to reset forge." });
  }
}
