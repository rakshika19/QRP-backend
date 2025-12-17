import express from 'express';
import authMiddleware from '../middleware/auth.Middleware.js';
import {
  submitChecklist,
  approveChecklist,
  requestChanges,
  getChecklistHistory,
  getChecklistById,
  createChecklistForStage,
  updateChecklist,
  deleteChecklist,
  getAllChecklists, // Add this new controller function
} from '../controllers/checklist.controller.js';

const router = express.Router();

// Get all checklists (filter by stage in frontend)
router.get("/checklists", getAllChecklists);
router.get("/checklists/:id", getChecklistById);
router.post("/checklists", authMiddleware, createChecklistForStage);
router.put("/checklists/:id", authMiddleware, updateChecklist);
router.delete("/checklists/:id", authMiddleware, deleteChecklist);
router.post("/checklists/:id/submit", authMiddleware, submitChecklist);
router.post("/checklists/:id/approve", authMiddleware, approveChecklist);
router.post("/checklists/:id/request-changes", authMiddleware, requestChanges);
router.get("/checklists/:id/history", authMiddleware, getChecklistHistory);

export default router;
