import React from "react";
import { Archive, Check } from "lucide-react";
import GlassCard from "./ui/GlassCard";

/**
 * Archive — Completed events archive with glassmorphism cards.
 */
export default function ArchiveView({ archivedEvents }) {
  function formatDate(dateStr) {
    if (!dateStr) return "Unknown";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <section className="list">
      {archivedEvents.length === 0 && (
        <GlassCard className="empty">
          <Archive size={32} />
          <strong>Your archive is empty.</strong>
        </GlassCard>
      )}
      {archivedEvents.map((event) => (
        <GlassCard key={event._id} className="item" style={{ gridTemplateColumns: "1fr" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "1.6rem",
                height: "1.6rem",
                borderRadius: "6px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Check size={14} style={{ color: "#10b981" }} />
            </div>
            <span style={{ fontWeight: 600 }}>
              {event.text}
              <small style={{ marginLeft: "0.5rem", color: "var(--lamp-muted)" }}>
                Completed {formatDate(event.doneDate)}
              </small>
            </span>
          </div>
        </GlassCard>
      ))}
    </section>
  );
}
