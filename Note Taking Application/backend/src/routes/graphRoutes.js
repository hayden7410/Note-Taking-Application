import express from "express";
import graphController from "../controllers/graphController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Traceability:
// UC-12 User merges notes into a visual representation using tags.
// UC-24 User organizes the visual display of notes.

router.get("/", graphController.getGraphsByUser);
router.get("/:graphId", graphController.getGraphById);
// Traceability: UC-12
router.post("/preview", graphController.generatePreview);
// Traceability: UC-12, UC-24
router.post("/", graphController.saveGraph);
// Traceability: UC-24
router.put("/:graphId", graphController.updateGraph);

export default router;
