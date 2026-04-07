import express from "express";
const router = express.Router();

import noteController from "../controllers/noteController.js";
import authenticate from "../middleware/authMiddleware.js";

router.use(authenticate);

// Traceability:
// UC-05 User creates a note.
// UC-07 User saves a note.
// UC-08 User modifies a note.
// UC-10 User deletes a note.
// UC-11 User reads a note.
// UC-13 User relocates notes into another folder.
// UC-17 User renames the title of the note.

// Traceability: UC-11
// GET /api/notes
router.get("/", noteController.getNotesByUser);

// Traceability: UC-11
// GET /api/notes/unfoldered
router.get("/unfoldered", noteController.getUnfolderedNotesByUser);

// Traceability: UC-11
// GET /api/notes/folder/:folderId
router.get("/folder/:folderId", noteController.getNotesByFolder);

// Traceability: UC-11
// GET /api/notes/:noteId
router.get("/:noteId", noteController.getNoteById);

// Traceability: UC-05
// POST /api/notes
router.post("/", noteController.createNote);

// Traceability: UC-07, UC-08, UC-17
// PUT /api/notes/:noteId
router.put("/:noteId", noteController.updateNote);

// Traceability: UC-10
// DELETE /api/notes/:noteId
router.delete("/:noteId", noteController.deleteNote);

// Traceability: UC-13
// PUT /api/notes/:noteId/move
router.put("/:noteId/move", noteController.moveNoteToFolder);

export default router;