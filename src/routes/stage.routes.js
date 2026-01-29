import express from "express";
import authMiddleware from "../middleware/auth.Middleware.js";
import { getStageById, updateStage, deleteStage, listStagesForProject, createStage, submitStageForReview, reviewDecision, getStageInfo } from "../controllers/stage.controller.js";

const router = express.Router();

router.get("/:id", getStageById);
router.put("/:id", updateStage);
router.delete("/:id", deleteStage);

// Get complete stage info with subtopics, checkpoints, and history
router.get("/:stageId/info", authMiddleware, getStageInfo);

// Moved from project.routes.js:
// GET/POST /api/v1/projects/:projectId/stages (protected)
router.get("/projects/:projectId/stages", authMiddleware, listStagesForProject);
router.post("/projects/:projectId/stages", authMiddleware, createStage);

//review related route 
// Submit stage for review
router.post("/:stageId/submit-for-review", authMiddleware, submitStageForReview);

// Review decision (approve or send back to draft)
router.post("/:stageId/review-decision", authMiddleware, reviewDecision);

export default router;