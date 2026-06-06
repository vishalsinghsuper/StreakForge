import React from "react";
import { Flame, Moon, RotateCcw, LogOut } from "lucide-react";
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
export default function Sidebar({ user, stats, onLogout, onReset, onMidnight }) {
  const initials = user.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : "?";

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

      {/* Actions */}
      <div className="sidebar-actions">
        <GlowButton variant="glass" onClick={onMidnight}>
          <Moon size={16} /> Midnight Reset
        </GlowButton>
        <GlowButton variant="danger" onClick={onReset}>
          <RotateCcw size={16} /> Reset Forge
        </GlowButton>
      </div>

      {/* Profile */}
      <div className="profile">
        <div className="avatar-glow">{initials}</div>
        <span>{user.display_name}</span>
      </div>
      <GlowButton variant="ghost" onClick={onLogout} style={{ marginTop: "0.5rem" }}>
        <LogOut size={16} /> Logout
      </GlowButton>
    </aside>
  );
}
