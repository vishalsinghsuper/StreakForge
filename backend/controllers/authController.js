import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import UserState from "../models/UserState.js";
import Habit from "../models/Habit.js";
import Note from "../models/Note.js";
import Event from "../models/Event.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";

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
    profilePicture: user.profilePicture,
    dateOfBirth: user.dateOfBirth,
    themePreference: user.themePreference,
    createdAt: user.createdAt,
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
      
      const origin = req.get('origin') || req.get('referer')?.split('/')[0] + '//' + req.get('referer')?.split('/')[2];
      await sendVerificationEmail(user, rawToken, origin);
    }

    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ detail: `Server error during signup: ${err.message}`, error: err.message });
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
    res.status(500).json({ detail: `Server error during login: ${err.message}` });
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
    
    const origin = req.get('origin') || req.get('referer')?.split('/')[0] + '//' + req.get('referer')?.split('/')[2];
    await sendVerificationEmail(user, rawToken, origin);

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

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ detail: "Email is required." });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists — always return success
      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    const rawToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });
    
    const origin = req.get('origin') || req.get('referer')?.split('/')[0] + '//' + req.get('referer')?.split('/')[2];
    await sendPasswordResetEmail(user, rawToken, origin);

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ detail: "Server error." });
  }
}

// POST /api/auth/reset-password/:token
export async function resetPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ detail: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ detail: "Invalid or expired reset token." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ message: "Password reset successfully.", token, user: publicUser(user) });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ detail: "Server error." });
  }
}

// PUT /api/auth/profile — update user profile details
export async function updateProfile(req, res) {
  try {
    const { displayName, dateOfBirth, profilePicture } = req.body;
    if (!displayName || !displayName.trim()) {
      return res.status(400).json({ detail: "Display name cannot be empty." });
    }

    const user = req.user;
    user.displayName = displayName.trim();
    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();
    res.json(publicUser(user));
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ detail: "Failed to update profile." });
  }
}

// PUT /api/auth/change-password — update user password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ detail: "Both current and new passwords are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ detail: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ detail: "Incorrect current password." });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ detail: "Failed to change password." });
  }
}

// PUT /api/auth/theme — update theme preference
export async function updateTheme(req, res) {
  try {
    const { themePreference } = req.body;
    if (!["dark", "light"].includes(themePreference)) {
      return res.status(400).json({ detail: "Invalid theme preference." });
    }

    const user = req.user;
    user.themePreference = themePreference;
    await user.save();
    res.json(publicUser(user));
  } catch (err) {
    console.error("updateTheme error:", err);
    res.status(500).json({ detail: "Failed to update theme preference." });
  }
}

// GET /api/auth/export — export all user data
export async function exportData(req, res) {
  try {
    const userId = req.user._id;
    const [habits, notes, events, userState] = await Promise.all([
      Habit.find({ userId }),
      Note.find({ userId }),
      Event.find({ userId }),
      UserState.findOne({ userId }),
    ]);

    const data = {
      user: {
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        createdAt: req.user.createdAt,
        dateOfBirth: req.user.dateOfBirth,
      },
      streaks: userState || {},
      habits: habits.map((h) => ({
        text: h.text,
        pillar: h.pillar,
        done: h.done,
        createdAt: h.createdAt,
      })),
      notes: notes.map((n) => ({
        title: n.title,
        content: n.content,
        attachments: n.attachments,
        createdAt: n.createdAt,
      })),
      events: events.map((e) => ({
        text: e.text,
        deadline: e.deadline,
        done: e.done,
        isArchived: e.isArchived,
        doneDate: e.doneDate,
        createdAt: e.createdAt,
      })),
    };

    res.setHeader("Content-Disposition", "attachment; filename=streakforge_data.json");
    res.setHeader("Content-Type", "application/json");
    res.json(data);
  } catch (err) {
    console.error("exportData error:", err);
    res.status(500).json({ detail: "Failed to export data." });
  }
}

// DELETE /api/auth/reset-data — delete stats, habits, events, and notes
export async function resetData(req, res) {
  try {
    const userId = req.user._id;

    // Reset streaks
    await UserState.findOneAndUpdate(
      { userId },
      {
        $set: {
          activePillar: "General",
          statsMaster: { current: 0, prev: 0, best: 0 },
          statsIron: { current: 0, prev: 0, best: 0 },
          statsMind: { current: 0, prev: 0, best: 0 },
          statsGeneral: { current: 0, prev: 0, best: 0 },
        },
      },
      { upsert: true }
    );

    // Delete notes, habits, and events
    await Promise.all([
      Habit.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      Note.deleteMany({ userId }),
    ]);

    res.json({ message: "All Forge data reset successfully." });
  } catch (err) {
    console.error("resetData error:", err);
    res.status(500).json({ detail: "Failed to reset data." });
  }
}

// DELETE /api/auth/delete-account — delete full account and all associated data
export async function deleteAccount(req, res) {
  try {
    const userId = req.user._id;

    await Promise.all([
      Habit.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      UserState.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("deleteAccount error:", err);
    res.status(500).json({ detail: "Failed to delete account." });
  }
}
