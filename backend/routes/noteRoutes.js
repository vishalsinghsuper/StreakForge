import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getNotes, createNote, updateNote, deleteNote } from "../controllers/noteController.js";

const router = Router();
router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
