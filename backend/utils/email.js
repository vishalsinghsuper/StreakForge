import nodemailer from "nodemailer";

/**
 * Create a Nodemailer transporter using SMTP env vars.
 * Returns null if SMTP is not configured (dev mode).
 */
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send email verification link to the user.
 * In dev mode (no SMTP configured), logs the link to console instead.
 */
export async function sendVerificationEmail(user, rawToken, origin) {
  const frontendUrl = origin && origin !== 'undefined' ? origin : process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email/${rawToken}`;

  const transporter = createTransporter();

  const html = `
    <div style="max-width:520px;margin:0 auto;font-family:Inter,system-ui,sans-serif;background:#0a0a12;color:#f1f5f9;padding:2rem;border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="display:inline-block;width:48px;height:48px;line-height:48px;font-size:24px;background:linear-gradient(135deg,#f97316,#8b5cf6);border-radius:12px;">🔥</div>
        <h1 style="margin:1rem 0 0;font-size:1.5rem;color:#fff;">Welcome to StreakForge</h1>
      </div>
      <p style="color:#94a3b8;line-height:1.6;">Hey <strong style="color:#fff;">${user.displayName}</strong>, verify your email to start forging unbreakable discipline.</p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${verifyUrl}" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#6d5dfc,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">Verify Email</a>
      </div>
      <p style="color:#64748b;font-size:0.85rem;text-align:center;">This link expires in 24 hours.</p>
    </div>
  `;

  if (!transporter) {
    // Dev mode — no SMTP configured, auto-log the URL
    console.log("\n📧 [DEV MODE] Email verification link:");
    console.log(`   ${verifyUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"StreakForge" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Verify your StreakForge account",
    html,
  });
}

/**
 * Send password reset link to the user.
 * In dev mode (no SMTP configured), logs the link to console instead.
 */
export async function sendPasswordResetEmail(user, rawToken, origin) {
  const frontendUrl = origin && origin !== 'undefined' ? origin : process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

  const transporter = createTransporter();

  const html = `
    <div style="max-width:520px;margin:0 auto;font-family:Inter,system-ui,sans-serif;background:#0a0a12;color:#f1f5f9;padding:2rem;border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="display:inline-block;width:48px;height:48px;line-height:48px;font-size:24px;background:linear-gradient(135deg,#f97316,#8b5cf6);border-radius:12px;">🔑</div>
        <h1 style="margin:1rem 0 0;font-size:1.5rem;color:#fff;">Password Reset</h1>
      </div>
      <p style="color:#94a3b8;line-height:1.6;">Hey <strong style="color:#fff;">${user.displayName}</strong>, we received a request to reset your password. Click the button below to choose a new one.</p>
      <div style="text-align:center;margin:2rem 0;">
        <a href="${resetUrl}" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#6d5dfc,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem;">Reset Password</a>
      </div>
      <p style="color:#64748b;font-size:0.85rem;text-align:center;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.log("\n🔑 [DEV MODE] Password reset link:");
    console.log(`   ${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"StreakForge" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Reset your StreakForge password",
    html,
  });
}
