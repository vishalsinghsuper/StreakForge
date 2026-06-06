import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getStats, updateStats, midnightReset, resetForge } from "../controllers/stateController.js";

const router = Router();
router.use(protect);

router.get("/", getStats);
router.put("/", updateStats);
router.post("/midnight", midnightReset);
router.delete("/", resetForge);

export default router;
