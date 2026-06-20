import { Router } from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import {
  signup,
  login,
  me,
  logout,
  resendVerification,
  verifyEmail,
  updateProfile,
  changePassword,
  updateTheme,
  exportData,
  resetData,
  deleteAccount,
} from "../controllers/authController.js";

// Configure Multer for Avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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

// Profile and Settings Management Routes
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/theme", protect, updateTheme);
router.get("/export", protect, exportData);
router.delete("/reset-data", protect, resetData);
router.delete("/delete-account", protect, deleteAccount);
router.post("/profile-picture", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "No file uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
