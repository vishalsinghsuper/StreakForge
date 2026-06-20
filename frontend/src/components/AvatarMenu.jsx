import React, { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  LogOut as LogOutIcon,
  MessageSquare as MessageSquareIcon,
  AlertTriangle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

/**
 * AvatarMenu component
 * Clicking the avatar opens a dropdown menu.
 * Logout confirmation is shown inline inside the dropdown — never below the dashboard.
 */
export default function AvatarMenu({ user, onSelect, onLogout }) {
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setConfirmingLogout(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        if (confirmingLogout) {
          setConfirmingLogout(false);
        } else {
          setOpen(false);
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [confirmingLogout]);

  const initials = user.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.username
    ? user.username[0].toUpperCase()
    : "?";

  const avatarSrc = user.profilePicture
    ? user.profilePicture.startsWith("http")
      ? user.profilePicture
      : `${API_BASE}${user.profilePicture}`
    : null;

  const handleItem = (type) => {
    if (type === "feedback") {
      setOpen(false);
      setConfirmingLogout(false);
      const gmailUrl =
        "https://mail.google.com/mail/?view=cm&fs=1" +
        "&to=vishal.singh.cb24@ggits.net" +
        "&su=StreakForge%20Feedback" +
        "&body=Hello%20Vishal%2C%0A%0AI%20would%20like%20to%20share%20the%20following%20feedback%3A%0A";
      window.open(gmailUrl, "_blank", "noopener,noreferrer");
    } else if (type === "logout") {
      // Show inline confirmation — don't close dropdown
      setConfirmingLogout(true);
    } else {
      setOpen(false);
      setConfirmingLogout(false);
      onSelect(type);
    }
  };

  const handleConfirmLogout = () => {
    setOpen(false);
    setConfirmingLogout(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setConfirmingLogout(false);
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Premium Avatar Button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setConfirmingLogout(false);
        }}
        className="avatar-trigger-btn"
        aria-label="User menu"
        title={user.display_name || user.username}
      >
        <div className="avatar-ring-outer">
          <div className="avatar-circle-inner">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <span className="avatar-initials-text">{initials}</span>
            )}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="avatar-dropdown-menu">
          {!confirmingLogout ? (
            <>
              {/* User identity row */}
              <div className="avatar-dropdown-identity">
                <div className="avatar-dropdown-identity-avatar">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#fff" }}>{initials}</span>
                  )}
                </div>
                <div className="avatar-dropdown-identity-info">
                  <strong>{user.display_name || user.username}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="avatar-dropdown-divider" />

              <button onClick={() => handleItem("profile")} className="avatar-menu-item">
                <UserIcon size={14} /> Profile
              </button>
              <button onClick={() => handleItem("settings")} className="avatar-menu-item">
                <SettingsIcon size={14} /> Settings
              </button>
              <button onClick={() => handleItem("about")} className="avatar-menu-item">
                <InfoIcon size={14} /> About StreakForge
              </button>
              <button onClick={() => handleItem("feedback")} className="avatar-menu-item">
                <MessageSquareIcon size={14} /> Send Feedback
              </button>

              <div className="avatar-dropdown-divider" />

              <button
                onClick={() => handleItem("logout")}
                className="avatar-menu-item avatar-menu-item--danger"
              >
                <LogOutIcon size={14} /> Logout
              </button>
            </>
          ) : (
            /* ── Inline Logout Confirmation ── */
            <div className="avatar-logout-confirm">
              <div className="avatar-logout-confirm-icon">
                <AlertTriangle size={18} />
              </div>
              <p className="avatar-logout-confirm-title">Leave the Forge?</p>
              <p className="avatar-logout-confirm-desc">
                You'll need to sign in again to access your data.
              </p>
              <div className="avatar-logout-confirm-actions">
                <button
                  className="avatar-logout-cancel-btn"
                  onClick={handleCancelLogout}
                >
                  Cancel
                </button>
                <button
                  className="avatar-logout-confirm-btn"
                  onClick={handleConfirmLogout}
                >
                  <LogOutIcon size={13} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
