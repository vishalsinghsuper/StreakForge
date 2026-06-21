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

/* ── Root App ── */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Screen state: "landing" | "auth" | "dashboard"
  const [screen, setScreen] = useState("landing");

  const pathname = window.location.pathname;
  const isVerifyEmail = pathname.startsWith("/verify-email/");
  const verifyToken = isVerifyEmail ? pathname.split("/").pop() : null;

  useEffect(() => {
    if (isVerifyEmail) { setLoading(false); return; }
    if (!getToken()) { setLoading(false); return; }

    api.me()
      .then((me) => { setUser(me); setScreen("dashboard"); })
      .catch((err) => { console.error("Auth init failed:", err); clearToken(); })
      .finally(() => setLoading(false));
  }, [isVerifyEmail]);

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
