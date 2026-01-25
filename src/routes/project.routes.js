import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";
import verifyJWT from "../middleware/auth.Middleware.js";

const router = express.Router();

router.get("/",verifyJWT, getAllProjects);
router.get("/:id", getProjectById);
router.post("/", verifyJWT, createProject);
router.put("/:id", verifyJWT, updateProject);
router.delete("/:id", verifyJWT, deleteProject);

export default router;