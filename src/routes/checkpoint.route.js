import { Router } from "express";
import {
  createCheckPoint,
  getCheckpointsByChecklistId,
  updateCheckpointResponse,
  deleteCheckPoint,
  getCheckPointById,
  saveCheckpoint,
  getImages,
} from "../controllers/checkpoint.controller.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Get all checkpoints for a specific checklist
// router.get(
//   "/:checkListId",
//   getCheckpointsByChecklistId
// );

// Create a new checkpoint for a checklist
router.post(
  "/:checkListId",
  createCheckPoint
);

// Get all images from checkpoint or transaction
router.post(
  "/images",
  getImages
);

// Save checkpoint (with optional images)
router.patch(
  "/:checkpointId/save",
  upload.array("images", 5),
  saveCheckpoint
);

// Update checkpoint response (with optional images)
router.patch(
  "/:checkpointId",
  upload.array("images", 5),
  updateCheckpointResponse
);

// Delete a checkpoint
router.delete(
  "/:checkpointId",
  deleteCheckPoint
);

router.get("/:checkpointId", getCheckPointById);


router.delete(
  "/:checkpointId",
  deleteCheckPoint
);




//review related route 
// Save checkpoint from executor/reviewer with images optional 
router.patch(
  "/:checkpointId/save",
  upload.array("images", 5),
  saveCheckpoint
);


export default router;
