import express from 'express';
import {
  submitChecklist,
  approveChecklist,
  requestChanges,
  getChecklistHistory
} from '../controllers/checklistController.js';

const router = express.Router();

router.post('/:id/submit', submitChecklist);
router.post('/:id/approve', approveChecklist);
router.post('/:id/request-changes', requestChanges);
router.get('/:id/history', getChecklistHistory);

export default router;
