import React, { useState } from "react";
import { BookOpen, Save, Trash2 } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";

/**
 * Notes — Field notes with glassmorphism cards,
 * note creation form, and delete functionality.
 */
export default function Notes({ notes, onAddNote, onDeleteNote }) {
  const [note, setNote] = useState({ title: "", content: "" });

  function handleAdd(e) {
    e.preventDefault();
    if (!note.title.trim() && !note.content.trim()) return;
    onAddNote({ title: note.title, content: note.content });
    setNote({ title: "", content: "" });
  }

  function formatDate(dateStr) {
    try {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  return (
    <section>
      {/* Add Note Form */}
      <form className="note-form" onSubmit={handleAdd}>
        <input
          id="add-note-title"
          placeholder="Title"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
        />
        <textarea
          id="add-note-content"
          placeholder="Write your thoughts here..."
          value={note.content}
          onChange={(e) => setNote({ ...note, content: e.target.value })}
        />
        <GlowButton type="submit">
          <Save size={18} /> Save Note
        </GlowButton>
      </form>

      {/* Notes List */}
      <div className="cards">
        {notes.length === 0 && (
          <GlassCard className="empty">
            <BookOpen size={32} />
            <strong>No notes saved yet.</strong>
          </GlassCard>
        )}
        {notes.map((item) => (
          <GlassCard key={item._id} className="note-card">
            <div>
              <h3>{item.title || "Untitled"}</h3>
              <time>{formatDate(item.createdAt)}</time>
              {item.content && <p>{item.content}</p>}
            </div>
            <button
              className="btn-icon"
              title="Delete"
              onClick={() => onDeleteNote(item._id)}
            >
              <Trash2 size={16} />
            </button>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
