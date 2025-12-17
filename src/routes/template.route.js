import {Router} from "express";
import authMiddleware from "../middleware/auth.Middleware";
import { createTemplate, getTemplate, editTemplate, deleteTemplate } from "../controllers/template.controller.js";

const router = Router();

router.route("/create").post( createTemplate);
router.route("/edit").post(editTemplate);
router.route("/get").get(getTemplate);
router.route("/delete").delete(deleteTemplate);

export default router;