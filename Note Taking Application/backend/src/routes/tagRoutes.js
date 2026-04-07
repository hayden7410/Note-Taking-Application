import express from "express";
import tagController from "../controllers/tagController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Traceability:
// UC-09 User tags a note.
// UC-15 User searches notes by tags.

// Traceability: UC-15
router.get("/", tagController.getTagsByUser);
// Traceability: UC-09
router.get("/note/:noteId", tagController.getTagsByNote);
// Traceability: UC-15
router.get("/:tagId/notes", tagController.getNotesByTag);
// Traceability: UC-09
router.post("/", tagController.createTag);
// Traceability: UC-09
router.put("/:tagId", tagController.updateTag);
// Traceability: UC-09
router.delete("/:tagId/notes/:noteId", tagController.removeTagFromNote);

export default router;
