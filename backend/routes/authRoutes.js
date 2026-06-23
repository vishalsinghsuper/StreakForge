import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/auth.js";
import {
  signup,
  login,
  me,
  logout,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  updateTheme,
  exportData,
  resetData,
  deleteAccount,
} from "../controllers/authController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve uploads directory relative to this file — not the process CWD
const uploadsDir = path.join(__dirname, "..", "uploads");

// Configure Multer for Avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile picture."));
    }
  },
});

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/resend-verification", resendVerification);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Profile and Settings Management Routes
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/theme", protect, updateTheme);
router.get("/export", protect, exportData);
router.delete("/reset-data", protect, resetData);
router.delete("/delete-account", protect, deleteAccount);
router.post("/profile-picture", protect, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    // Immediately persist the new avatar URL to the user document
    req.user.profilePicture = fileUrl;
    await req.user.save({ validateBeforeSave: false });
  } catch (err) {
    console.error("Failed to save profile picture to DB:", err);
    // Still return the URL — the file was saved, even if DB write failed
  }
  res.json({ url: fileUrl });
});


export default router;
