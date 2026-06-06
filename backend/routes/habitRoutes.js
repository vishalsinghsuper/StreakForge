import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getHabits, createHabit, updateHabit, deleteHabit } from "../controllers/habitController.js";

const router = Router();
router.use(protect);

router.get("/", getHabits);
router.post("/", createHabit);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

export default router;
