import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";

// Traceability:
// UC-01 User creates an account.
// UC-02 User logs in.

// Traceability: UC-02
// POST /api/auth/login
router.post("/login", authController.login);

// Traceability: UC-01
// POST /api/auth/register
router.post("/register", authController.register);

export default router;