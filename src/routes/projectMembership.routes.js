import express from "express";
import verifyJWT from "../middleware/auth.Middleware.js";
import {
  getProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember
} from "../controllers/projectMembership.controller.js";

const router = express.Router();

// Project membership routes with :id parameters
router.get("/:id/members", verifyJWT, getProjectMembers);           // GET /api/v1/projects-membership/:id/members
router.post("/:id/members", verifyJWT, addProjectMember);           // POST /api/v1/projects-membership/:id/members  
router.put("/:id/members/:userId", verifyJWT, updateProjectMember); // PUT /api/v1/projects-membership/:id/members/:userId
router.delete("/:id/members/:userId", verifyJWT, removeProjectMember); // DELETE /api/v1/projects-membership/:id/members/:userId

export default router;