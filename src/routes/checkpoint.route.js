import { Router } from "express";
import {
  createCheckPoint,
  updateCheckpointResponse,
  deleteCheckPoint,
} from "../controllers/checkpoint.controller.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();


router.post(
  "/checklists/:checkListId/checkpoints",
  createCheckPoint
);


router.patch(
  "/checkpoints/:checkpointId",
  upload.array("images", 5),
  updateCheckpointResponse
);


router.delete(
  "/checkpoints/:checkpointId",
  deleteCheckPoint
);
router.get("/checkpoints/:checkpointId",  getCheckPointById);
router.get("/checklists/:checkListId/checkpoints", getCheckpointsByChecklist);
export default router;
