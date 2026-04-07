import express from "express";
const router = express.Router();

import folderController from "../controllers/folderController.js";
import authenticate from "../middleware/authMiddleware.js";

router.use(authenticate);

// Traceability:
// UC-18 User creates a folder.
// UC-19 User deletes a folder.
// UC-20 User renames the title of the folder.

// GET /api/folders
router.get("/", folderController.getFoldersByUser);

// GET /api/folders/:folderId
router.get("/:folderId", folderController.getFolderById);

// Traceability: UC-18
// POST /api/folders
router.post("/", folderController.createFolder);

// Traceability: UC-20
// PUT /api/folders/:folderId
router.put("/:folderId", folderController.renameFolder);

// Traceability: UC-19
// DELETE /api/folders/:folderId
router.delete("/:folderId", folderController.deleteFolder);

export default router;