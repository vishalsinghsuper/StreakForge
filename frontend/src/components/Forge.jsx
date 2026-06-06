import React, { useState } from "react";
import { Plus, Pencil, Trash2, X, Sparkles } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";
import ProgressBar from "./ui/ProgressBar";

const PILLARS = {
  Iron: { icon: "💪", label: "Iron" },
  Mind: { icon: "🧠", label: "Mind" },
  General: { icon: "📊", label: "General" },
};

/**
 * Forge — Habit tracker with pillar tabs, progress bar,
 * habit cards with glow checkboxes, edit/delete, and inline editing.
 */
export default function Forge({ habits, activePillar, onAddHabit, onUpdateHabit, onDeleteHabit, onChangePillar }) {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const completed = habits.filter((h) => h.done).length;

  function handleAdd(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddHabit(text.trim());
    setText("");
  }

  function startEdit(habit) {
    setEditing(habit._id);
    setEditText(habit.text);
  }

  function saveEdit(habitId) {
    if (editText.trim()) {
      onUpdateHabit(habitId, { text: editText.trim() });
    }
    setEditing(null);
  }

  return (
    <section>
      {/* Pillar Tabs */}
      <div className="pillar-tabs">
        {Object.entries(PILLARS).map(([key, pillar]) => (
          <button
            key={key}
            className={activePillar === key ? "selected" : ""}
            onClick={() => onChangePillar(key)}
          >
            <span>{pillar.icon}</span> {pillar.label}
          </button>
        ))}
      </div>

      {/* Add Habit Form */}
      <form className="input-row" onSubmit={handleAdd}>
        <input
          id="add-habit-input"
          placeholder="e.g., Drink 3L of water"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <GlowButton type="submit">
          <Plus size={18} /> Add
        </GlowButton>
      </form>

      {/* Progress */}
      <ProgressBar completed={completed} total={habits.length} />

      {/* Habit List */}
      <div className="list" style={{ marginTop: "1rem" }}>
        {habits.length === 0 && (
          <GlassCard className="empty">
            <Sparkles size={32} />
            <strong>Your Forge is empty. Add a habit to start building discipline.</strong>
          </GlassCard>
        )}
        {habits.map((habit) => (
          <GlassCard key={habit._id} className="item">
            <label className="checkline">
              <input
                type="checkbox"
                checked={habit.done}
                onChange={(e) =>
                  onUpdateHabit(habit._id, { done: e.target.checked })
                }
              />
              <span className={habit.done ? "done" : ""}>
                {PILLARS[habit.pillar]?.icon} {habit.text}
              </span>
            </label>
            <button
              className="btn-icon"
              title="Edit"
              onClick={() =>
                editing === habit._id ? setEditing(null) : startEdit(habit)
              }
            >
              {editing === habit._id ? <X size={16} /> : <Pencil size={16} />}
            </button>
            <button
              className="btn-icon"
              title="Delete"
              onClick={() => onDeleteHabit(habit._id)}
            >
              <Trash2 size={16} />
            </button>

            {/* Inline Edit */}
            {editing === habit._id && (
              <div className="edit-inline">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(habit._id)}
                />
                <GlowButton variant="glass" onClick={() => saveEdit(habit._id)}>
                  Save
                </GlowButton>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
