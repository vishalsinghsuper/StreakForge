import React, { useState, useEffect } from "react";
import {
  Flame,
  Target,
  CalendarCheck,
  BookOpen,
  BarChart3,
  StickyNote,
  Zap,
  ChevronRight,
  Shield,
  ArrowRight,
} from "lucide-react";
import LampEffect from "./ui/LampEffect";

/* ─────────────────────────────────────────────
   Feature data — edit here to add/remove cards
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Flame,
    title: "All-or-Nothing Engine",
    description:
      "No partial credit. StreakForge runs on the brutal truth: you either executed your standard today, or you didn't. The discipline engine resets at midnight.",
    color: "var(--lamp-glow-secondary)",
    colorRgb: "249, 115, 22",
    tag: "Core Engine",
  },
  {
    icon: Target,
    title: "Habit Tracking",
    description:
      "Build habits across three pillars — Iron (body), Mind (intellect), and General discipline. Watch your streaks compound into identity.",
    color: "var(--lamp-glow-primary)",
    colorRgb: "139, 92, 246",
    tag: "Habits",
  },
  {
    icon: CalendarCheck,
    title: "Event Board",
    description:
      "Capture deadlines, missions, and objectives. Mark them complete, archive them, or track them as they approach. Nothing slips through the cracks.",
    color: "var(--lamp-glow-cyan)",
    colorRgb: "6, 182, 212",
    tag: "Events",
  },
  {
    icon: BookOpen,
    title: "Field Notes",
    description:
      "Your personal knowledge vault. Write reflections, strategies, and breakthroughs. Attach images. Build a second brain inside your Forge.",
    color: "var(--lamp-glow-emerald)",
    colorRgb: "16, 185, 129",
    tag: "Notes",
  },
  {
    icon: BarChart3,
    title: "Streak Analytics",
    description:
      "Track your current streak, personal best, and shadow scores across every pillar. See the compound effect of consistency in real numbers.",
    color: "var(--lamp-glow-primary)",
    colorRgb: "139, 92, 246",
    tag: "Analytics",
  },
  {
    icon: StickyNote,
    title: "Archive & History",
    description:
      "Completed events never disappear — they live in your Archive as proof of execution. Your record of victory, permanently stored.",
    color: "var(--lamp-glow-secondary)",
    colorRgb: "249, 115, 22",
    tag: "Archive",
  },
];

const PRINCIPLES = [
  { emoji: "🔥", label: "Discipline over Motivation" },
  { emoji: "🎯", label: "Consistency over Intensity" },
  { emoji: "⚔️", label: "Accountability over Excuses" },

];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, color, colorRgb, tag, index }) {
  return (
    <div
      className="lp-feature-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="lp-feature-card-top">
        <div
          className="lp-feature-icon"
          style={{
            background: `rgba(${colorRgb}, 0.1)`,
            border: `1px solid rgba(${colorRgb}, 0.25)`,
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <span className="lp-feature-tag">{tag}</span>
      </div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main LandingPage
───────────────────────────────────────────── */
export default function LandingPage({ onEnter }) {
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleCTA() {
    if (transitioning) return;
    setTransitioning(true);
    // 500ms premium fade-out then hand off to auth
    setTimeout(() => onEnter(), 520);
  }

  return (
    <div className={`lp-root ${mounted ? "lp-mounted" : ""} ${transitioning ? "lp-exiting" : ""}`}>
      <LampEffect />

      {/* ── NAV ── */}
      <header className="lp-nav">
        <div className="lp-nav-brand">
          <div className="brand-mark">
            <Flame size={18} color="#fff" />
          </div>
          <span className="lp-nav-wordmark">StreakForge</span>
        </div>
        <button className="lp-nav-login" onClick={handleCTA}>
          Already a member? <span>Login</span>
        </button>
      </header>

      {/* ── HERO ── */}
      <section className="lp-hero">
        {/* Badge */}
        <div className="lp-badge">
          <span className="lp-badge-dot" />
          <span>Forge Discipline. Build Legacy.</span>
        </div>

        <h1 className="lp-hero-title">
          Forge Your Day.<br />
          <span className="lp-hero-gradient">Fuel Your Legacy.</span>
        </h1>

        <p className="lp-hero-sub">
          StreakForge is your personal operating system for discipline and growth.
          Build unbreakable habits, track your progress, and become the best
          version of yourself — one day at a time.
        </p>

        {/* Quick feature pills */}
        <div className="lp-hero-pills">
          {PRINCIPLES.map((p) => (
            <span key={p.label} className="lp-hero-pill">
              {p.emoji} {p.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="lp-cta-wrap">
          <button
            className={`lp-cta-btn ${transitioning ? "lp-cta-fired" : ""}`}
            onClick={handleCTA}
            disabled={transitioning}
          >
            <Flame size={20} className="lp-cta-icon" />
            Start Your Streak
            <ArrowRight size={18} className="lp-cta-arrow" />
          </button>
          <p className="lp-cta-sub">
            Your forge. Your rules.{" "}
            <span style={{ color: "var(--lamp-glow-primary)" }}>Your legacy.</span>
          </p>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="lp-features-section">
        <div className="lp-section-label">
          <Zap size={14} />
          <span>What's Inside</span>
        </div>
        <h2 className="lp-section-title">
          Everything you need.<br />Nothing you don't.
        </h2>
        <p className="lp-section-sub">
          Built for the disciplined. Not a wellness app. Not a to-do list.
          A forge.
        </p>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ── PHILOSOPHY SECTION ── */}
      <section className="lp-philosophy-section">
        <div className="lp-philosophy-card">
          <div className="lp-philosophy-glow" />
          <div className="lp-section-label" style={{ justifyContent: "center" }}>
            <Shield size={14} />
            <span>The Forge Philosophy</span>
          </div>
          <blockquote className="lp-philosophy-quote">
            "Forge a stronger version of yourself every day."
          </blockquote>
          <p className="lp-philosophy-body">
            Most habit apps reward you for showing up halfway. StreakForge doesn't.
            The <strong>All-or-Nothing Engine</strong> means you either executed
            your full standard today — or you broke the chain. That's the only way
            discipline compounds into identity.
          </p>
          <div className="lp-philosophy-pillars">
            {PRINCIPLES.map((p) => (
              <div key={p.label} className="lp-pillar-chip">
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION ── */}
      <section className="lp-final-cta-section">
        <h2 className="lp-final-cta-title">
          Ready to enter the Forge?
        </h2>
        <p className="lp-final-cta-sub">
          Free. No credit card. Just discipline.
        </p>
        <button
          className={`lp-cta-btn lp-cta-btn--large ${transitioning ? "lp-cta-fired" : ""}`}
          onClick={handleCTA}
          disabled={transitioning}
        >
          <Flame size={22} className="lp-cta-icon" />
          Start Your Streak
          <ChevronRight size={20} className="lp-cta-arrow" />
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <div className="brand-mark" style={{ width: "1.8rem", height: "1.8rem", fontSize: "0.85rem" }}>
            <Flame size={14} color="#fff" />
          </div>
          <span>StreakForge</span>
        </div>
        <p className="lp-footer-copy">
          Built by Vishal Kumar Singh · BTech CSBS, GGITS Jabalpur
        </p>
        <p className="lp-footer-version">v1.0.0 · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
