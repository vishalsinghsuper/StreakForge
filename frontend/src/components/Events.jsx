import React, { useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";

/**
 * Events — Event board with timeline/timeless toggle,
 * glassmorphism event cards, and completion tracking.
 */
export default function Events({ events, onAddEvent, onUpdateEvent, onDeleteEvent }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10));
  const [timeless, setTimeless] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddEvent({
      text: title.trim(),
      deadline: timeless ? null : deadline,
    });
    setTitle("");
  }

  function formatDeadline(dl) {
    if (!dl) return "Timeless";
    try {
      return `Due ${new Date(dl + "T00:00:00").toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch {
      return `Due ${dl}`;
    }
  }

  return (
    <section>
      {/* Add Event Form */}
      <form className="event-form" onSubmit={handleAdd}>
        <input
          id="add-event-input"
          placeholder="e.g., Submit Assignment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={deadline}
          disabled={timeless}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={timeless}
            onChange={(e) => setTimeless(e.target.checked)}
          />
          Timeless
        </label>
        <GlowButton type="submit">
          <Plus size={18} /> Post
        </GlowButton>
      </form>

      {/* Event List */}
      <div className="list">
        {events.length === 0 && (
          <GlassCard className="empty">
            <CalendarDays size={32} />
            <strong>No active events. Your board is clear.</strong>
          </GlassCard>
        )}
        {events.map((event) => (
          <GlassCard key={event._id} className="item">
            <label className="checkline">
              <input
                type="checkbox"
                checked={event.done}
                onChange={(e) =>
                  onUpdateEvent(event._id, {
                    done: e.target.checked,
                    doneDate: e.target.checked
                      ? new Date().toISOString().slice(0, 10)
                      : null,
                  })
                }
              />
              <span className={event.done ? "done" : ""}>
                {event.text}
                <small>{formatDeadline(event.deadline)}</small>
              </span>
            </label>
            <span />
            <button
              className="btn-icon"
              title="Delete"
              onClick={() => onDeleteEvent(event._id)}
            >
              <Trash2 size={16} />
            </button>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
