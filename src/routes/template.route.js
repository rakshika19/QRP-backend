import { Router } from "express";
import authMiddleware from "../middleware/auth.Middleware.js";

import {
  createTemplate,
  getTemplate,
  addChecklist,
  addCheckpoint,
  updateChecklist,
  updateCheckpoint,
  deleteChecklist,
  deleteCheckpoint,
} from "../controllers/template.controller.js";

const router = Router();

/**
 * Only ONE template in system
 */
router.post("/template", authMiddleware, createTemplate);
router.get("/template", authMiddleware, getTemplate);

/**
 * Checklist operations (PATCH)
 */
router.patch(
  "/template/checklists",
  authMiddleware,
  addChecklist
);

router.patch(
  "/template/checklists/:checklistId",
  authMiddleware,
  updateChecklist
);

router.delete(
  "/template/checklists/:checklistId",
  authMiddleware,
  deleteChecklist
);

/**
 * Checkpoint operations (PATCH)
 */
router.patch(
  "/template/checklists/:checklistId/checkpoints",
  authMiddleware,
  addCheckpoint
);

router.patch(
  "/template/checkpoints/:checkpointId",
  authMiddleware,
  updateCheckpoint
);

router.delete(
  "/template/checkpoints/:checkpointId",
  authMiddleware,
  deleteCheckpoint
);

export default router;
