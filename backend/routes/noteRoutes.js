import { Router } from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import { getNotes, createNote, updateNote, deleteNote, uploadFile } from "../controllers/noteController.js";

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|txt|md|csv|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz/i;
    const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname));
    
    // Allow if extension is approved, or if it is an image, pdf, or text mimetype
    if (
      isExtensionAllowed ||
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("text/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported. Please upload productivity documents or images."));
    }
  },
});

const router = Router();
router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/upload", upload.single("file"), uploadFile);

export default router;
