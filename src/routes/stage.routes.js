import express from "express";
import authMiddleware from "../middleware/auth.Middleware.js";
import { getStageById,updateStage,deleteStage } from "../controllers/stage.controller.js";
import { listChecklistsForStage, getChecklistById , createChecklistForStage,updateChecklist,deleteChecklist} from "../controllers/checklist.controller.js";
const router = express.Router();

router.get("/stages/:id", getStageById);
router.put("/stages/:id", updateStage);
router.delete("/stages/:id", deleteStage);
router.get("/stages/:stageId/checklists", listChecklistsForStage);
router.get("/checklists/:id", getChecklistById);
router.post("/stages/:stageId/checklists", createChecklistForStage);
router.put("/checklists/:id", updateChecklist);
router.delete("/checklists/:id", deleteChecklist);
export default router;