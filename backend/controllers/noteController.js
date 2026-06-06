import Note from "../models/Note.js";

// GET /api/notes — list all notes for the current user
export async function getNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("getNotes error:", err);
    res.status(500).json({ detail: "Failed to fetch notes." });
  }
}

// POST /api/notes — create a new note
export async function createNote(req, res) {
  try {
    const { title, content } = req.body;
    if (!title?.trim() && !content?.trim()) {
      return res.status(400).json({ detail: "Title or content is required." });
    }
    const note = await Note.create({
      userId: req.user._id,
      title: title || "",
      content: content || "",
    });
    res.status(201).json(note);
  } catch (err) {
    console.error("createNote error:", err);
    res.status(500).json({ detail: "Failed to create note." });
  }
}

// PUT /api/notes/:id — update a note
export async function updateNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ detail: "Note not found." });
    res.json(note);
  } catch (err) {
    console.error("updateNote error:", err);
    res.status(500).json({ detail: "Failed to update note." });
  }
}

// DELETE /api/notes/:id — delete a note
export async function deleteNote(req, res) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!note) return res.status(404).json({ detail: "Note not found." });
    res.status(204).end();
  } catch (err) {
    console.error("deleteNote error:", err);
    res.status(500).json({ detail: "Failed to delete note." });
  }
}
