import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import UserState from "../models/UserState.js";
import { sendVerificationEmail } from "../utils/email.js";

/** Helper to create and sign a JWT for a user */
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
}

/** Helper to format user for public response */
function publicUser(user) {
  return {
    username: user.username,
    display_name: user.displayName,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
  };
}

/** Whether SMTP is configured (determines if we enforce email verification) */
function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

// POST /api/auth/signup
export async function signup(req, res) {
  try {
    const { username, display_name, email, password } = req.body;

    if (!username || !display_name || !email || !password) {
      return res.status(400).json({ detail: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ detail: "Password must be at least 6 characters." });
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return res.status(400).json({ detail: "Username must be 3-20 chars: lowercase letters, numbers, underscores." });
    }

    // Check existing username/email
    if (await User.findOne({ username: normalizedUsername })) {
      return res.status(409).json({ detail: "That username is already taken." });
    }
    if (await User.findOne({ email: email.trim().toLowerCase() })) {
      return res.status(409).json({ detail: "An account already exists with that email." });
    }

    const user = await User.create({
      username: normalizedUsername,
      displayName: display_name.trim(),
      email: email.trim().toLowerCase(),
      password,
      // Auto-verify in dev mode (no SMTP)
      isEmailVerified: !smtpConfigured(),
    });

    // Initialize user state with default streak values
    await UserState.create({ userId: user._id });

    // Send verification email if SMTP is configured
    if (smtpConfigured()) {
      const rawToken = user.generateVerificationToken();
      await user.save({ validateBeforeSave: false });
      await sendVerificationEmail(user, rawToken);
    }

    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ detail: "Server error during signup." });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: "Username and password are required." });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ detail: "Incorrect username or password." });
    }

    // In production with SMTP, enforce email verification
    if (smtpConfigured() && !user.isEmailVerified) {
      return res.status(403).json({
        detail: "Please verify your email before logging in.",
        needsVerification: true,
      });
    }

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ detail: "Server error during login." });
  }
}

// GET /api/auth/me
export async function me(req, res) {
  res.json(publicUser(req.user));
}

// POST /api/auth/logout — stateless, client-side only
export async function logout(_req, res) {
  res.json({ message: "Logged out successfully." });
}

// POST /api/auth/resend-verification
export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ detail: "Email is required." });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ detail: "No account found with that email." });
    if (user.isEmailVerified) return res.json({ message: "Email is already verified." });

    const rawToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, rawToken);

    res.json({ message: "Verification email sent." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ detail: "Server error." });
  }
}

// GET /api/auth/verify-email/:token
export async function verifyEmail(req, res) {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ detail: "Invalid or expired verification token." });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ message: "Email verified successfully.", token, user: publicUser(user) });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ detail: "Server error." });
  }
}
