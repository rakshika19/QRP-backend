import { Router } from "express";
import authMiddleware from "../middleware/auth.Middleware.js";

import {
  createTemplate,
  getTemplate,
  addStage,
  addSubtopic,
  updateSubtopic,
  deleteSubtopic,
  addCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
} from "../controllers/template.controller.js";

const router = Router();

/**
 * Template Routes (Only ONE template in system)
 */
router.post("/", authMiddleware, createTemplate);           // POST /api/templates
router.get("/", authMiddleware, getTemplate);              // GET /api/templates

/**
 * Stage Routes
 */
router.post("/:templateId/stages", authMiddleware, addStage);  // POST /api/templates/:templateId/stages

/**
 * SubTopic Routes
 */
router.post(
  "/:templateId/stages/:stageIndex/subtopics",
  authMiddleware,
  addSubtopic
);                                                           // POST /api/templates/:templateId/stages/:stageIndex/subtopics

router.patch(
  "/:templateId/stages/:stageIndex/subtopics/:subTopicIndex",
  authMiddleware,
  updateSubtopic
);                                                           // PATCH /api/templates/:templateId/stages/:stageIndex/subtopics/:subTopicIndex

router.delete(
  "/:templateId/stages/:stageIndex/subtopics/:subTopicIndex",
  authMiddleware,
  deleteSubtopic
);                                                           // DELETE /api/templates/:templateId/stages/:stageIndex/subtopics/:subTopicIndex

/**
 * Checkpoint Routes
 */
router.post(
  "/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints",
  authMiddleware,
  addCheckpoint
);                                                           // POST /api/templates/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints

router.patch(
  "/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints/:checkpointIndex",
  authMiddleware,
  updateCheckpoint
);                                                           // PATCH /api/templates/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints/:checkpointIndex

router.delete(
  "/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints/:checkpointIndex",
  authMiddleware,
  deleteCheckpoint
);                                                           // DELETE /api/templates/:templateId/stages/:stageIndex/subtopics/:subTopicIndex/checkpoints/:checkpointIndex

export default router;