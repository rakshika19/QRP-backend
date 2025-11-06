import Checklist from '../models/checklist.models.js';
import ChecklistHistory from '../models/checklistTransaction.models.js';

/**
 * POST /api/checklists/:id/submit
 * Marks checklist as "pending" and logs the action.
 */
export const submitChecklist = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const userId = req.body.user_id;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });

    checklist.status = 'pending';
    checklist.revision_number += 1;
    await checklist.save();

    await ChecklistHistory.create({
      checklist_id: checklist._id,
      user_id: userId,
      action_type: 'SUBMITTED_FOR_REVIEW',
      description: `Checklist "${checklist.checklist_name}" was submitted for review.`
    });

    res.status(200).json({ message: 'Checklist submitted for review successfully', checklist });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting checklist', error: err.message });
  }
};

/**
 * POST /api/checklists/:id/approve
 * Marks checklist as "approved" and logs the action.
 */
export const approveChecklist = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const userId = req.body.user_id;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });

    checklist.status = 'approved';
    await checklist.save();

    await ChecklistHistory.create({
      checklist_id: checklist._id,
      user_id: userId,
      action_type: 'APPROVED',
      description: `Checklist "${checklist.checklist_name}" was approved.`
    });

    res.status(200).json({ message: 'Checklist approved successfully', checklist });
  } catch (err) {
    res.status(500).json({ message: 'Error approving checklist', error: err.message });
  }
};

/**
 * POST /api/checklists/:id/request-changes
 * Marks checklist as "changes_requested" and logs the action.
 */
export const requestChanges = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const userId = req.body.user_id;
    const { message } = req.body;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ message: 'Checklist not found' });

    checklist.status = 'changes_requested';
    await checklist.save();

    await ChecklistHistory.create({
      checklist_id: checklist._id,
      user_id: userId,
      action_type: 'CHANGES_REQUESTED',
      description: message || `Changes were requested for checklist "${checklist.checklist_name}".`
    });

    res.status(200).json({ message: 'Changes requested successfully', checklist });
  } catch (err) {
    res.status(500).json({ message: 'Error requesting changes', error: err.message });
  }
};

/**
 * GET /api/checklists/:id/history
 * Fetches the full audit history of a checklist.
 */
export const getChecklistHistory = async (req, res) => {
  try {
    const checklistId = req.params.id;

    const history = await ChecklistHistory.find({ checklist_id: checklistId })
      .populate('user_id', 'name email') // populate user info if available
      .sort({ createdAt: 1 });

    if (!history.length) {
      return res.status(404).json({ message: 'No history found for this checklist' });
    }

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching checklist history', error: err.message });
  }
};
