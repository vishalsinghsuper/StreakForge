import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User as UserIcon,
  Palette,
  Zap,
  Shield,
  Database,
  AlertTriangle,
  Bell,
  Volume2,
  Download,
  Key,
  ShieldAlert,
  Loader2,
  Check,
  Moon,
  Sun,
  Flame,
  Target,
  Sword,
  Rocket,
  Code,
  GraduationCap,
  MapPin,
  Calendar,
  Hash,
  Mail,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

/* ─────────────────────────────────────────────
   PROFILE OVERLAY
───────────────────────────────────────────── */
function ProfileOverlay({ user, api, onUserUpdate, onClose, setToast }) {
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ""
  );
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const initials = user.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.username
    ? user.username[0].toUpperCase()
    : "?";

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadProfilePicture(file);
      setProfilePicture(res.url);
      setToast({ message: "Avatar uploaded! Save profile to apply." });
    } catch (err) {
      alert(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await api.updateProfile({
        displayName,
        dateOfBirth: dateOfBirth || null,
        profilePicture,
      });
      onUserUpdate(updatedUser);
      setToast({ message: "Profile saved successfully." });
      onClose();
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const avatarSrc = profilePicture
    ? profilePicture.startsWith("http")
      ? profilePicture
      : `${API_BASE}${profilePicture}`
    : null;

  return (
    <div className="ow-content">
      {/* Header */}
      <div className="ow-section-header">
        <UserIcon size={20} className="ow-section-icon" />
        <div>
          <h2 className="ow-section-title">Profile</h2>
          <p className="ow-section-subtitle">Manage your Forge identity</p>
        </div>
      </div>

      {/* Avatar + Greeting Hero */}
      <div className="ow-profile-hero">
        <div className="ow-avatar-wrap">
          <div className="ow-avatar-ring">
            <div className="ow-avatar-circle">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="ow-avatar-img" />
              ) : (
                <span className="ow-avatar-initials">{initials}</span>
              )}
              {isUploading && (
                <div className="ow-avatar-uploading">
                  <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              )}
            </div>
          </div>
          {/* Pencil edit button */}
          <button
            type="button"
            className="ow-avatar-edit-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Change photo"
            disabled={isUploading}
          >
            ✏️
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
        <div className="ow-profile-greeting">
          <h3 className="ow-greeting-text">
            Hello, {user.display_name || user.username} 👋
          </h3>
          <span className="ow-forge-badge">⚡ Forge Member</span>
        </div>
      </div>

      {/* Account Information Card */}
      <form onSubmit={handleSave} className="ow-form">
        <div className="ow-card">
          <div className="ow-card-header">
            <span className="ow-card-label">Account Information</span>
          </div>
          <div className="ow-field-grid">
            <div className="ow-field">
              <label className="ow-label">
                <UserIcon size={13} />
                Full Name
              </label>
              <input
                className="ow-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="ow-field">
              <label className="ow-label">
                <Mail size={13} />
                Email Address
              </label>
              <div className="ow-input ow-input--readonly">{user.email}</div>
            </div>
            <div className="ow-field">
              <label className="ow-label">
                <Calendar size={13} />
                Date of Birth
              </label>
              <input
                className="ow-input"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="ow-field">
              <label className="ow-label">
                <Hash size={13} />
                Username
              </label>
              <div className="ow-input ow-input--readonly">@{user.username}</div>
            </div>
            <div className="ow-field">
              <label className="ow-label">
                <Calendar size={13} />
                Joined Date
              </label>
              <div className="ow-input ow-input--readonly">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="ow-actions">
          <button
            type="submit"
            className="btn-glow ow-save-btn"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Saving…
              </>
            ) : (
              <>
                <Check size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTINGS OVERLAY
───────────────────────────────────────────── */
function SettingsOverlay({ user, api, onUserUpdate, onClose, setToast, onLogout }) {
  const currentTheme = user.themePreference || "dark";
  const [activeSection, setActiveSection] = useState("appearance");

  const [midnightReminder, setMidnightReminder] = useState(
    localStorage.getItem("sf_midnight_reminder") !== "false"
  );
  const [reflectionReminder, setReflectionReminder] = useState(
    localStorage.getItem("sf_reflection_reminder") !== "false"
  );
  const [completionSounds, setCompletionSounds] = useState(
    localStorage.getItem("sf_completion_sounds") !== "false"
  );
  const [streakProtection, setStreakProtection] = useState(
    localStorage.getItem("sf_streak_protection") !== "false"
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function toggleSetting(key, val, setter) {
    setter(val);
    localStorage.setItem(key, String(val));
    setToast({ message: "Preference updated." });
  }

  async function handleThemeChange(mode) {
    if (mode === currentTheme) return;
    try {
      const updatedUser = await api.updateTheme(mode);
      onUserUpdate(updatedUser);
      setToast({ message: `Switched to ${mode} mode.` });
    } catch (err) {
      alert(err.message || "Failed to update theme");
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPass(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setToast({ message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.message || "Failed to update password");
    } finally {
      setIsChangingPass(false);
    }
  }

  async function handleResetForge() {
    try {
      await api.resetData();
      setToast({ message: "All Forge data reset. Refreshing…" });
      window.location.reload();
    } catch (err) {
      alert(err.message || "Failed to reset Forge");
    }
  }

  async function handleDeleteAccount() {
    try {
      await api.deleteAccount();
      setToast({ message: "Account deleted. Goodbye." });
      onLogout();
    } catch (err) {
      alert(err.message || "Failed to delete account");
    }
  }

  const navItems = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "productivity", label: "Productivity", icon: Zap },
    { id: "account", label: "Account", icon: Shield },
    { id: "backup", label: "Backup", icon: Database },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="ow-settings-layout">
      {/* Left Nav */}
      <nav className="ow-settings-nav">
        <p className="ow-settings-nav-label">Settings</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`ow-settings-nav-item ${activeSection === item.id ? "active" : ""} ${item.danger ? "danger" : ""}`}
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Content */}
      <div className="ow-settings-content">
        {/* APPEARANCE */}
        {activeSection === "appearance" && (
          <div className="ow-content">
            <div className="ow-section-header">
              <Palette size={20} className="ow-section-icon" />
              <div>
                <h2 className="ow-section-title">Appearance</h2>
                <p className="ow-section-subtitle">Choose your Forge theme</p>
              </div>
            </div>
            <div className="ow-theme-cards">
              <button
                className={`ow-theme-card ${currentTheme === "dark" ? "selected" : ""}`}
                onClick={() => handleThemeChange("dark")}
              >
                <div className="ow-theme-preview ow-theme-preview--dark">
                  <div className="ow-theme-preview-bar" />
                  <div className="ow-theme-preview-content">
                    <div className="ow-theme-preview-line long" />
                    <div className="ow-theme-preview-line short" />
                    <div className="ow-theme-preview-dot" />
                  </div>
                </div>
                <div className="ow-theme-card-body">
                  <div className="ow-theme-card-top">
                    <Moon size={16} />
                    <span>Lamp Dark</span>
                    {currentTheme === "dark" && (
                      <span className="ow-theme-badge">Active</span>
                    )}
                  </div>
                  <p className="ow-theme-desc">
                    Deep dark mode with purple ambient glow. Premium night experience.
                  </p>
                </div>
              </button>

              <button
                className={`ow-theme-card ${currentTheme === "light" ? "selected" : ""}`}
                onClick={() => handleThemeChange("light")}
              >
                <div className="ow-theme-preview ow-theme-preview--light">
                  <div className="ow-theme-preview-bar light" />
                  <div className="ow-theme-preview-content">
                    <div className="ow-theme-preview-line long light" />
                    <div className="ow-theme-preview-line short light" />
                    <div className="ow-theme-preview-dot light" />
                  </div>
                </div>
                <div className="ow-theme-card-body">
                  <div className="ow-theme-card-top">
                    <Sun size={16} />
                    <span>Forge Light</span>
                    {currentTheme === "light" && (
                      <span className="ow-theme-badge">Active</span>
                    )}
                  </div>
                  <p className="ow-theme-desc">
                    Clean light mode for focused daytime productivity sessions.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTIVITY */}
        {activeSection === "productivity" && (
          <div className="ow-content">
            <div className="ow-section-header">
              <Zap size={20} className="ow-section-icon" />
              <div>
                <h2 className="ow-section-title">Productivity</h2>
                <p className="ow-section-subtitle">Tune your Forge behavior</p>
              </div>
            </div>
            <div className="ow-settings-cards">
              <SettingCard
                icon={<Bell size={18} />}
                title="Midnight Reset Reminder"
                description="Receive reminders before your Forge resets at midnight."
                checked={midnightReminder}
                onChange={(val) => toggleSetting("sf_midnight_reminder", val, setMidnightReminder)}
              />
              <SettingCard
                icon={<Zap size={18} />}
                title="Daily Reflection Reminder"
                description="Review your daily discipline at the end of the day."
                checked={reflectionReminder}
                onChange={(val) => toggleSetting("sf_reflection_reminder", val, setReflectionReminder)}
              />
              <SettingCard
                icon={<Volume2 size={18} />}
                title="Habit Completion Sound"
                description="Play subtle audio feedback when you complete a habit."
                checked={completionSounds}
                onChange={(val) => toggleSetting("sf_completion_sounds", val, setCompletionSounds)}
              />
              <SettingCard
                icon={<Shield size={18} />}
                title="Streak Protection Confirmation"
                description="Confirm before deleting habits to protect your streak data."
                checked={streakProtection}
                onChange={(val) => toggleSetting("sf_streak_protection", val, setStreakProtection)}
              />
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {activeSection === "account" && (
          <div className="ow-content">
            <div className="ow-section-header">
              <Key size={20} className="ow-section-icon" />
              <div>
                <h2 className="ow-section-title">Account</h2>
                <p className="ow-section-subtitle">Security and credentials</p>
              </div>
            </div>
            <div className="ow-card">
              <div className="ow-card-header">
                <span className="ow-card-label">Change Password</span>
              </div>
              <form onSubmit={handlePasswordChange} className="ow-form">
                <div className="ow-field-grid">
                  <div className="ow-field">
                    <label className="ow-label">Current Password</label>
                    <input
                      className="ow-input"
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ow-field">
                    <label className="ow-label">New Password</label>
                    <input
                      className="ow-input"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-glow"
                  style={{ alignSelf: "flex-start" }}
                  disabled={isChangingPass}
                >
                  {isChangingPass ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* BACKUP */}
        {activeSection === "backup" && (
          <div className="ow-content">
            <div className="ow-section-header">
              <Database size={20} className="ow-section-icon" />
              <div>
                <h2 className="ow-section-title">Backup</h2>
                <p className="ow-section-subtitle">Export and protect your data</p>
              </div>
            </div>
            <div className="ow-card">
              <div className="ow-card-header">
                <span className="ow-card-label">Data Export</span>
              </div>
              <div className="ow-backup-content">
                <div className="ow-backup-icon-wrap">
                  <Download size={32} />
                </div>
                <div>
                  <p className="ow-backup-title">Export Forge Ledger</p>
                  <p className="ow-backup-desc">
                    Download a complete backup of all your habits, events, notes, and streaks.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-glass"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}
                  onClick={async () => {
                    try {
                      await api.exportData();
                      setToast({ message: "Ledger backup downloaded." });
                    } catch (err) {
                      alert(err.message || "Failed to export data");
                    }
                  }}
                >
                  <Download size={15} /> Export My Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE */}
        {activeSection === "danger" && (
          <div className="ow-content">
            <div className="ow-section-header">
              <ShieldAlert size={20} style={{ color: "var(--lamp-glow-rose)" }} />
              <div>
                <h2 className="ow-section-title" style={{ color: "var(--lamp-glow-rose)" }}>
                  Danger Zone
                </h2>
                <p className="ow-section-subtitle">Irreversible actions. Take extreme caution.</p>
              </div>
            </div>

            <div className="ow-danger-card">
              <div className="ow-danger-row">
                <div>
                  <p className="ow-danger-title">Reset Forge Data</p>
                  <p className="ow-danger-desc">
                    Permanently delete all habits, events, notes, and streak data. This cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => setShowResetConfirm(true)}
                >
                  Reset Data
                </button>
              </div>
              <div className="ow-danger-divider" />
              <div className="ow-danger-row">
                <div>
                  <p className="ow-danger-title">Delete Account</p>
                  <p className="ow-danger-desc">
                    Permanently remove your profile, all data, and revoke access to StreakForge.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              </div>
            </div>

            {showResetConfirm && (
              <div className="ow-confirm-modal">
                <div className="ow-confirm-panel">
                  <ShieldAlert size={32} style={{ color: "var(--lamp-glow-rose)", marginBottom: "0.75rem" }} />
                  <h3 style={{ color: "var(--lamp-glow-rose)", marginBottom: "0.5rem" }}>Reset all data?</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--lamp-text-secondary)", marginBottom: "1.5rem" }}>
                    This will delete all habits, events, notes, and completely clear your streaks. This cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn-glass" style={{ flex: 1 }} onClick={() => setShowResetConfirm(false)}>Cancel</button>
                    <button className="btn-danger" style={{ flex: 1 }} onClick={handleResetForge}>Reset Data</button>
                  </div>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="ow-confirm-modal">
                <div className="ow-confirm-panel">
                  <ShieldAlert size={32} style={{ color: "var(--lamp-glow-rose)", marginBottom: "0.75rem" }} />
                  <h3 style={{ color: "var(--lamp-glow-rose)", marginBottom: "0.5rem" }}>Delete your account?</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--lamp-text-secondary)", marginBottom: "1.5rem" }}>
                    We will permanently remove your profile, streaks, habits, events, and notes from StreakForge.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn-glass" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    <button className="btn-danger" style={{ flex: 1 }} onClick={handleDeleteAccount}>Delete Account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ABOUT OVERLAY
───────────────────────────────────────────── */
function AboutOverlay({ onClose }) {
  const principles = [
    { emoji: "🔥", title: "Discipline", desc: "over Motivation" },
    { emoji: "🎯", title: "Consistency", desc: "over Intensity" },
    { emoji: "⚔️", title: "Accountability", desc: "over Excuses" },
    { emoji: "🚀", title: "Growth", desc: "over Comfort" },
  ];

  return (
    <div className="ow-content">
      <div className="ow-section-header">
        <Flame size={20} className="ow-section-icon" />
        <div>
          <h2 className="ow-section-title">About StreakForge</h2>
          <p className="ow-section-subtitle">The Self-Improvement Operating System</p>
        </div>
      </div>

      {/* Mission Card */}
      <div className="ow-about-cards">
        <div className="ow-card ow-about-mission">
          <div className="ow-card-header">
            <span className="ow-card-label">Mission</span>
          </div>
          <p className="ow-about-mission-text">
            <strong>StreakForge</strong> is a premium self-improvement operating system built around
            discipline, consistency, and accountability. Unlike traditional habit trackers,
            StreakForge uses an <em>All-or-Nothing discipline engine</em> that rewards complete
            commitment rather than partial effort.
          </p>
          <blockquote className="ow-about-quote">
            "Forge a stronger version of yourself every day."
          </blockquote>
        </div>

        {/* Core Principles */}
        <div className="ow-card">
          <div className="ow-card-header">
            <span className="ow-card-label">Core Principles</span>
          </div>
          <div className="ow-principles-grid">
            {principles.map((p) => (
              <div key={p.title} className="ow-principle-card">
                <span className="ow-principle-emoji">{p.emoji}</span>
                <div>
                  <p className="ow-principle-title">{p.title}</p>
                  <p className="ow-principle-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Card */}
        <div className="ow-card ow-founder-card">
          <div className="ow-card-header">
            <span className="ow-card-label">Developer</span>
          </div>
          <div className="ow-founder-body">
            <div className="ow-founder-avatar" style={{ padding: 0, overflow: "hidden", background: "transparent" }}>
              <img
                src="/assets/vishal-avatar.jpg"
                alt="Vishal Kumar Singh"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
              />
              <div className="ow-founder-avatar-glow" />
            </div>
            <div className="ow-founder-info">
              <h3 className="ow-founder-name">Vishal Kumar Singh</h3>
              <p className="ow-founder-role">Founder & Creator</p>
              <div className="ow-founder-tags">
                <span className="ow-tag"><GraduationCap size={12} /> BTech CSBS</span>
                <span className="ow-tag"><MapPin size={12} /> GGITS Jabalpur</span>
                <span className="ow-tag"><Code size={12} /> Full Stack</span>
              </div>
              <p className="ow-founder-bio">
                Passionate about discipline, self-improvement, and technology. Building tools
                that help people become the best version of themselves.
              </p>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="ow-card">
          <div className="ow-card-header">
            <span className="ow-card-label">Version Information</span>
          </div>
          <div className="ow-version-grid">
            <div className="ow-version-item">
              <span className="ow-version-label">Version</span>
              <strong className="ow-version-value">v1.0.0</strong>
            </div>
            <div className="ow-version-item">
              <span className="ow-version-label">Environment</span>
              <strong className="ow-version-value">Production</strong>
            </div>
            <div className="ow-version-item">
              <span className="ow-version-label">Last Updated</span>
              <strong className="ow-version-value">June 2026</strong>
            </div>
            <div className="ow-version-item">
              <span className="ow-version-label">Stack</span>
              <strong className="ow-version-value">React + Node</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SETTING CARD COMPONENT (Premium toggle card)
───────────────────────────────────────────── */
function SettingCard({ icon, title, description, checked, onChange }) {
  return (
    <div className="ow-setting-card">
      <div className="ow-setting-card-icon">{icon}</div>
      <div className="ow-setting-card-text">
        <p className="ow-setting-card-title">{title}</p>
        <p className="ow-setting-card-desc">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`ow-toggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ow-toggle-knob" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   OVERLAY WORKSPACE SHELL
───────────────────────────────────────────── */
export default function OverlayWorkspace({ type, user, api, onUserUpdate, onClose, setToast, onLogout }) {
  // ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const titles = {
    profile: "Profile",
    settings: "Settings",
    about: "About StreakForge",
  };

  const subtitles = {
    profile: "Manage your Forge identity",
    settings: "Customize your Forge experience",
    about: "The Self-Improvement Operating System",
  };

  return (
    <div className="ow-backdrop" onClick={onClose}>
      <div className="ow-window" onClick={(e) => e.stopPropagation()}>
        {/* Top Bar */}
        <div className="ow-topbar">
          <div className="ow-topbar-brand">
            <div className="ow-topbar-brand-icon">
              <Flame size={16} />
            </div>
            <div>
              <p className="ow-topbar-title">{titles[type]}</p>
              <p className="ow-topbar-subtitle">{subtitles[type]}</p>
            </div>
          </div>
          <button className="ow-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="ow-body">
          {type === "profile" && (
            <ProfileOverlay
              user={user}
              api={api}
              onUserUpdate={onUserUpdate}
              onClose={onClose}
              setToast={setToast}
            />
          )}
          {type === "settings" && (
            <SettingsOverlay
              user={user}
              api={api}
              onUserUpdate={onUserUpdate}
              onClose={onClose}
              setToast={setToast}
              onLogout={onLogout}
            />
          )}
          {type === "about" && <AboutOverlay onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
