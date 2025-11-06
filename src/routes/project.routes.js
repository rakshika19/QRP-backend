import express from "express";
// import authMiddleware from "../middleware/auth.Middleware.js";
import { listStagesForProject } from "../controllers/stage.controller.js";
import { createStage } from "../controllers/stage.controller.js";
const router = express.Router();

// GET /api/v1/projects/:projectId/stages
router.get("/projects/:projectId/stages", listStagesForProject);
router.post("/projects/:projectId/stages", createStage);

export default router;