import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getEvents,
  getArchivedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

const router = Router();
router.use(protect);

router.get("/", getEvents);
router.get("/archive", getArchivedEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
