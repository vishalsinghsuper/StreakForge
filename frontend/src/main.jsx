import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, getToken, clearToken } from "./api";
import "./theme.css";
import "./animations.css";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import GlassCard from "./components/ui/GlassCard";
import GlowButton from "./components/ui/GlowButton";
import LampEffect from "./components/ui/LampEffect";
import { Check, AlertTriangle } from "lucide-react";

/* ── Email Verification Page ── */
function EmailVerificationPage({ token, onAuthed }) {
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");
  const [verifiedUser, setVerifiedUser] = useState(null);

  useEffect(() => {
    async function verify() {
      try {
        const data = await api.verifyEmail(token);
        api.setToken(data.token);
        setVerifiedUser(data.user);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err.message || "Invalid or expired verification link.");
      }
    }
    verify();
  }, [token]);

  return (
    <>
      <LampEffect />
      <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
        <GlassCard variant="elevated" className="auth-panel" style={{ width: "100%", maxWidth: "450px" }}>
          {status === "verifying" && (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="brand-mark" style={{ margin: "0 auto 1.5rem" }}>
                <div className="loading" style={{ minHeight: "auto", display: "inline-block" }} />
              </div>
              <h2>Verifying Email...</h2>
              <p className="auth-subtitle">Hold tight while we activate your account in the Forge.</p>
            </div>
          )}
          {status === "success" && (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <div className="brand-mark" style={{ margin: "0 auto 1.5rem", background: "linear-gradient(135deg, var(--lamp-glow-emerald), var(--lamp-glow-primary))" }}>
                <Check size={28} color="#fff" />
              </div>
              <h2>Verification Successful</h2>
              <p className="auth-subtitle">Your email is verified. Welcome to StreakForge!</p>
              <GlowButton onClick={() => { window.history.pushState({}, "", "/"); onAuthed(verifiedUser); }} style={{ marginTop: "1rem" }}>
                Enter the Dashboard
              </GlowButton>
            </div>
          )}
          {status === "error" && (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <div className="brand-mark" style={{ margin: "0 auto 1.5rem", background: "linear-gradient(135deg, var(--lamp-glow-rose), var(--lamp-glow-secondary))" }}>
                <AlertTriangle size={28} color="#fff" />
              </div>
              <h2>Verification Failed</h2>
              <p className="auth-subtitle" style={{ color: "#fecaca" }}>{error}</p>
              <GlowButton variant="glass" onClick={() => { window.location.href = "/"; }} style={{ marginTop: "1rem" }}>
                Back to Login
              </GlowButton>
            </div>
          )}
        </GlassCard>
      </main>
    </>
  );
}

/* ── Password Reset Page (from email link) ── */
function PasswordResetPage({ token, onAuthed }) {
  const [status, setStatus] = useState("form"); // "form" | "success" | "error"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetUser, setResetUser] = useState(null);

  // Import Eye icons inline
  const EyeIcon = ({ open }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const data = await api.resetPassword(token, { password });
      api.setToken(data.token);
      setResetUser(data.user);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Invalid or expired reset link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <LampEffect />
      <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
        <GlassCard variant="elevated" className="auth-panel" style={{ width: "100%", maxWidth: "450px" }}>
          {status === "form" && (
            <>
              <div className="auth-logo-row">
                <div className="auth-logo-box">
                  <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                    <path d="M16 2L4 8V24L16 30L28 24V8L16 2Z" fill="#fff" fillOpacity="0.16" />
                    <path d="M16 4.5L6.5 9.25V22.75L16 27.5L25.5 22.75V9.25L16 4.5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 11V21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 14V18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 13V19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="auth-logo-text">StreakForge</span>
              </div>
              <h2 className="auth-heading">Set New Password</h2>
              <p className="auth-subtitle">Choose a strong password for your account.</p>

              <form onSubmit={handleReset}>
                <div className="auth-input-group">
                  <label htmlFor="reset-password">New Password</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reset-password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="auth-password-input"
                    />
                    <button type="button" className="auth-toggle-password" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="reset-confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="reset-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="auth-password-input"
                    />
                    <button type="button" className="auth-toggle-password" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit" className="auth-submit-btn" disabled={busy}>
                  {busy ? (<><span className="auth-spinner" />Resetting...</>) : "Reset Password"}
                </button>
              </form>
            </>
          )}
          {status === "success" && (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <div className="brand-mark" style={{ margin: "0 auto 1.5rem", background: "linear-gradient(135deg, var(--lamp-glow-emerald), var(--lamp-glow-primary))" }}>
                <Check size={28} color="#fff" />
              </div>
              <h2>Password Reset!</h2>
              <p className="auth-subtitle">Your password has been updated successfully.</p>
              <GlowButton onClick={() => { window.history.pushState({}, "", "/"); onAuthed(resetUser); }} style={{ marginTop: "1rem" }}>
                Enter the Dashboard
              </GlowButton>
            </div>
          )}
          {status === "error" && (
            <div style={{ textAlign: "center", padding: "1.5rem" }}>
              <div className="brand-mark" style={{ margin: "0 auto 1.5rem", background: "linear-gradient(135deg, var(--lamp-glow-rose), var(--lamp-glow-secondary))" }}>
                <AlertTriangle size={28} color="#fff" />
              </div>
              <h2>Reset Failed</h2>
              <p className="auth-subtitle" style={{ color: "#fecaca" }}>{error}</p>
              <GlowButton variant="glass" onClick={() => { window.location.href = "/"; }} style={{ marginTop: "1rem" }}>
                Back to Login
              </GlowButton>
            </div>
          )}
        </GlassCard>
      </main>
    </>
  );
}

/* ── Root App ── */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Screen state: "landing" | "auth" | "dashboard"
  const [screen, setScreen] = useState("landing");

  const pathname = window.location.pathname;
  const isVerifyEmail = pathname.startsWith("/verify-email/");
  const verifyToken = isVerifyEmail ? pathname.split("/").pop() : null;
  const isResetPassword = pathname.startsWith("/reset-password/");
  const resetToken = isResetPassword ? pathname.split("/").pop() : null;

  useEffect(() => {
    if (isVerifyEmail || isResetPassword) { setLoading(false); return; }
    if (!getToken()) { setLoading(false); return; }

    api.me()
      .then((me) => { setUser(me); setScreen("dashboard"); })
      .catch((err) => { console.error("Auth init failed:", err); clearToken(); })
      .finally(() => setLoading(false));
  }, [isVerifyEmail, isResetPassword]);

  // Sync theme to document root
  useEffect(() => {
    // If user is logged in, use their server-side preference
    // Otherwise use the landing-page theme from localStorage (default: light)
    const theme = user?.themePreference || localStorage.getItem("sf_lp_theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, [user]);

  if (loading) {
    return (
      <>
        <LampEffect />
        <div className="loading">Loading StreakForge...</div>
      </>
    );
  }

  if (isVerifyEmail && verifyToken) {
    return (
      <EmailVerificationPage
        token={verifyToken}
        onAuthed={(u) => { setUser(u); setScreen("dashboard"); }}
      />
    );
  }

  if (isResetPassword && resetToken) {
    return (
      <PasswordResetPage
        token={resetToken}
        onAuthed={(u) => { setUser(u); setScreen("dashboard"); }}
      />
    );
  }

  // Authenticated — go straight to dashboard, skip landing
  if (user) {
    return (
      <Dashboard
        user={user}
        api={api}
        onUserUpdate={(u) => setUser(u)}
        onLogout={async () => {
          try { await api.logout(); } catch (e) { console.error(e); }
          clearToken();
          setUser(null);
          setScreen("landing");
        }}
      />
    );
  }

  // Unauthenticated: landing → auth
  if (screen === "landing") {
    return <LandingPage onEnter={() => setScreen("auth")} />;
  }

  return (
    <AuthPage
      onAuthed={(u) => { setUser(u); setScreen("dashboard"); }}
      onBack={() => setScreen("landing")}
      api={api}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);
