import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import GlassCard from "./ui/GlassCard";
import GlowButton from "./ui/GlowButton";
import LampEffect from "./ui/LampEffect";

/**
 * AuthPage — Login, Signup, Forgot Password, and Email Verification.
 * Premium Lamp Theme with StreakForge branding, glassmorphism panel,
 * password visibility toggle, and smooth transitions between auth states.
 */
export default function AuthPage({ onAuthed, onBack, api }) {
  // "login" | "signup" | "verify" | "forgot" | "forgot-sent"
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    forgotEmail: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setInfo("");
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
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          setBusy(false);
          return;
        }
        const data = await api.signup({
          username: form.username,
          display_name: form.display_name,
          email: form.email,
          password: form.password,
        });
        api.setToken(data.token);

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

  async function handleForgotPassword(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.forgotPassword({ email: form.forgotEmail });
      setMode("forgot-sent");
      setInfo("If an account with that email exists, a password reset link has been sent.");
    } catch (err) {
      setError(err.message);
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

  /* StreakForge logo SVG */
  const LogoSVG = () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="28" height="28">
      <path d="M16 2L4 8V24L16 30L28 24V8L16 2Z" fill="#fff" fillOpacity="0.16" />
      <path d="M16 4.5L6.5 9.25V22.75L16 27.5L25.5 22.75V9.25L16 4.5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11V21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 14V18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 13V19" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  /* Logo row shared across all auth states */
  const LogoRow = () => (
    <div className="auth-logo-row">
      <div className="auth-logo-box"><LogoSVG /></div>
      <span className="auth-logo-text">StreakForge</span>
    </div>
  );

  /* Render forgot password form */
  function renderForgotPassword() {
    return (
      <>
        <LogoRow />
        <button
          type="button"
          className="auth-back-link"
          onClick={() => switchMode("login")}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>
        <h2 className="auth-heading">Reset Password</h2>
        <p className="auth-subtitle">
          Enter the email linked to your account and we'll send you a reset link.
        </p>

        <form onSubmit={handleForgotPassword}>
          <div className="auth-input-group">
            <label htmlFor="auth-forgot-email">Email Address</label>
            <input
              id="auth-forgot-email"
              type="email"
              value={form.forgotEmail}
              onChange={(e) => updateField("forgotEmail", e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="auth-spinner" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </>
    );
  }

  /* Render forgot-sent confirmation */
  function renderForgotSent() {
    return (
      <>
        <LogoRow />
        <div className="auth-success-icon">✉️</div>
        <h2 className="auth-heading">Check Your Email</h2>
        <p className="auth-subtitle">
          {info || "We sent a password reset link to your email. Check your inbox and click the link to reset your password."}
        </p>
        <p className="auth-subtitle" style={{ fontSize: "0.82rem", marginTop: "-0.5rem" }}>
          Didn't receive it? Check your spam folder or try again.
        </p>

        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
          <button
            type="button"
            className="auth-submit-btn"
            onClick={() => {
              switchMode("forgot");
            }}
          >
            Try Again
          </button>
          <GlowButton
            variant="ghost"
            onClick={() => switchMode("login")}
          >
            Back to Sign In
          </GlowButton>
        </div>
      </>
    );
  }

  /* Render verify email state */
  function renderVerify() {
    return (
      <>
        <LogoRow />
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
            onClick={() => switchMode("login")}
          >
            Back to Login
          </GlowButton>
        </div>
      </>
    );
  }

  /* Render login / signup form */
  function renderAuthForm() {
    return (
      <>
        <LogoRow />

        <h2 className="auth-heading">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Enter your credentials to start your forge."
            : "Create your StreakForge account to start stacking wins."}
        </p>

        {mode === "signup" && (
          <button
            type="button"
            className="auth-back-link"
            onClick={() => switchMode("login")}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="auth-input-group">
                <label htmlFor="auth-display-name">Full Name</label>
                <input
                  id="auth-display-name"
                  value={form.display_name}
                  onChange={(e) => updateField("display_name", e.target.value)}
                  placeholder="Your display name"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label htmlFor="auth-email">Email Address</label>
                <input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value.toLowerCase())}
              placeholder="your username"
              required
            />
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label htmlFor="auth-password">Password</label>
              {mode === "login" && (
                <span
                  className="auth-forgot"
                  onClick={() => switchMode("forgot")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && switchMode("forgot")}
                >
                  Forgot?
                </span>
              )}
            </div>
            <div className="auth-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="••••••••"
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="auth-password-input"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div className="auth-input-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="auth-password-input"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label="Toggle confirm password visibility"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="auth-spinner" />
                Working...
              </>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <div className="auth-footer">
            {mode === "login" ? (
              <>
                New to StreakForge?{" "}
                <span onClick={() => switchMode("signup")}>Create Account</span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => switchMode("login")}>Sign In</span>
              </>
            )}
          </div>
        </form>
      </>
    );
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
            <LogoSVG />
          </div>
          <h1>Enter the Forge.</h1>
          <p>
            Build your day like a quest: sharpen your habits, clear your events,
            bank your notes, and watch discipline turn into streak power.
          </p>
        </section>

        {/* Right: Auth Panel */}
        <GlassCard variant="elevated" className="auth-panel">
          {mode === "verify" && renderVerify()}
          {mode === "forgot" && renderForgotPassword()}
          {mode === "forgot-sent" && renderForgotSent()}
          {(mode === "login" || mode === "signup") && renderAuthForm()}
        </GlassCard>
      </main>
    </>
  );
}
