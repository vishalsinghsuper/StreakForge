import Event from "../models/Event.js";

// GET /api/events — list active (non-archived) events for the current user
export async function getEvents(req, res) {
  try {
    const events = await Event.find({ userId: req.user._id, isArchived: false }).sort({ createdAt: 1 });
    res.json(events);
  } catch (err) {
    console.error("getEvents error:", err);
    res.status(500).json({ detail: "Failed to fetch events." });
  }
}

// GET /api/events/archive — list archived events
export async function getArchivedEvents(req, res) {
  try {
    const events = await Event.find({ userId: req.user._id, isArchived: true }).sort({ updatedAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("getArchivedEvents error:", err);
    res.status(500).json({ detail: "Failed to fetch archive." });
  }
}

// POST /api/events — create a new event
export async function createEvent(req, res) {
  try {
    const { text, deadline, createdAfterEditCutoff } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ detail: "Event text is required." });
    }
    const event = await Event.create({
      userId: req.user._id,
      text: text.trim(),
      deadline: deadline || null,
      createdAfterEditCutoff: createdAfterEditCutoff || false,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("createEvent error:", err);
    res.status(500).json({ detail: "Failed to create event." });
  }
}

// PUT /api/events/:id — update an event
export async function updateEvent(req, res) {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ detail: "Event not found." });
    res.json(event);
  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ detail: "Failed to update event." });
  }
}

// DELETE /api/events/:id — delete an event
export async function deleteEvent(req, res) {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!event) return res.status(404).json({ detail: "Event not found." });
    res.status(204).end();
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ detail: "Failed to delete event." });
  }
}
