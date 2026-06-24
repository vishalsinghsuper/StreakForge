import React from "react";
import { Flame } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";

const PILLARS = {
  Iron: { icon: "💪", label: "Iron" },
  Mind: { icon: "🧠", label: "Mind" },
  General: { icon: "📊", label: "General" },
};

/**
 * Sidebar — Analytics ledger, streak stats, actions, and user profile.
 * Features: glowing brand mark, gradient streak counter, shadow streaks,
 * midnight/reset buttons, and user avatar with glow.
 */
export default function Sidebar({ stats }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark">
          <Flame size={18} color="#fff" />
        </div>
        <strong>StreakForge</strong>
      </div>

      {/* Master Streak */}
      <div className="section-label">The Ledger</div>
      <GlassCard className="stat-card large">
        <span className="stat-label">🔥 Master Streak</span>
        <span className="stat-value">{stats.statsMaster?.current ?? 0} Days</span>
      </GlassCard>

      <div className="stat-grid">
        <GlassCard className="stat-card">
          <span className="stat-label">📊 Prev</span>
          <span className="stat-value">{stats.statsMaster?.prev ?? 0}</span>
        </GlassCard>
        <GlassCard className="stat-card">
          <span className="stat-label">🏆 PB</span>
          <span className="stat-value">{stats.statsMaster?.best ?? 0}</span>
        </GlassCard>
      </div>

      {/* Shadow Streaks */}
      <div className="section-label" style={{ marginTop: "1.5rem" }}>Shadow Streaks</div>
      {Object.entries(PILLARS).map(([key, pillar]) => {
        const statKey = `stats${key}`;
        const value = stats[statKey]?.current ?? 0;
        return (
          <div className="shadow-row" key={key}>
            <span>{pillar.icon} {pillar.label}</span>
            <strong>{value}</strong>
          </div>
        );
      })}



    </aside>
  );
}
