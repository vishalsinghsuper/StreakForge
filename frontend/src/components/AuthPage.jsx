import React, { useState } from "react";
import { Flame } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";
import LampEffect from "./ui/LampEffect";

/**
 * AuthPage — Login, Signup, and Email Verification.
 * Premium Lamp Theme with ambient lighting, glassmorphism panel,
 * and smooth transitions between auth states.
 */
export default function AuthPage({ onAuthed, onBack, api }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    try {
      if (mode === "login") {
        const data = await api.login({
          username: form.username,
          password: form.password,
        });
        api.setToken(data.token);
        onAuthed(data.user);
      } else if (mode === "signup") {
        const data = await api.signup({
          username: form.username,
          display_name: form.display_name,
          email: form.email,
          password: form.password,
        });
        api.setToken(data.token);

        // If email is already verified (dev mode), go straight to dashboard
        if (data.user.isEmailVerified) {
          onAuthed(data.user);
        } else {
          setMode("verify");
          setInfo("Account created! Check your email for a verification link.");
        }
      }
    } catch (err) {
      if (err.needsVerification) {
        setMode("verify");
        setInfo("Please verify your email before logging in.");
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification() {
    setBusy(true);
    setError("");
    try {
      await api.resendVerification({ email: form.email });
      setInfo("Verification email resent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <LampEffect />
      <main className="auth-page">
        {/* Left: Brand Intro */}
        <section className="auth-intro">
          {onBack && (
            <button
              onClick={onBack}
              className="auth-back-btn"
              aria-label="Back to home"
            >
              ← Back to Home
            </button>
          )}
          <div className="brand-mark">
            <Flame size={28} color="#fff" />
          </div>
          <h1>Enter the Forge.</h1>
          <p>
            Build your day like a quest: sharpen your habits, clear your events,
            bank your notes, and watch discipline turn into streak power.
          </p>
        </section>

        {/* Right: Auth Panel */}
        <GlassCard variant="elevated" className="auth-panel">
          {mode === "verify" ? (
            /* Email Verification State */
            <>
              <h2>Verify Your Email</h2>
              <p className="auth-subtitle">
                We sent a verification link to <strong>{form.email}</strong>
              </p>
              {info && <div className="info-box">{info}</div>}
              {error && <div className="error">{error}</div>}
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                <GlowButton
                  variant="glass"
                  onClick={handleResendVerification}
                  loading={busy}
                >
                  Resend Verification Email
                </GlowButton>
                <GlowButton
                  variant="ghost"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setInfo("");
                  }}
                >
                  Back to Login
                </GlowButton>
              </div>
            </>
          ) : (
            /* Login / Signup Forms */
            <>
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="auth-subtitle">
                {mode === "login"
                  ? "Your forge is warm. Log in to continue."
                  : "Claim your forge and start stacking wins."}
              </p>

              <form onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <>
                    <label>
                      Display Name
                      <input
                        id="auth-display-name"
                        value={form.display_name}
                        onChange={(e) =>
                          updateField("display_name", e.target.value)
                        }
                        placeholder="Vishal"
                        required
                      />
                    </label>
                    <label>
                      Email
                      <input
                        id="auth-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                  </>
                )}

                <label>
                  Username
                  <input
                    id="auth-username"
                    value={form.username}
                    onChange={(e) =>
                      updateField("username", e.target.value.toLowerCase())
                    }
                    placeholder="your username"
                    required
                  />
                </label>

                <label>
                  Password
                  <input
                    id="auth-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder={
                      mode === "signup" ? "At least 6 characters" : "••••••••"
                    }
                    required
                    minLength={mode === "signup" ? 6 : undefined}
                  />
                </label>

                {error && <div className="error">{error}</div>}

                <GlowButton type="submit" loading={busy}>
                  {mode === "login" ? "Login" : "Create Account"}
                </GlowButton>

                <GlowButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setInfo("");
                  }}
                >
                  {mode === "login"
                    ? "Create a new account"
                    : "Back to login"}
                </GlowButton>
              </form>
            </>
          )}
        </GlassCard>
      </main>
    </>
  );
}
