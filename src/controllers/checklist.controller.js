import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Checklist from "../models/checklist.models.js";
const createChecklistForStage = asyncHandler(async (req, res) => {
    const { stageId } = req.params;
    const { checklist_name, description, status } = req.body;
  
    if (!mongoose.isValidObjectId(stageId)) {
      throw new ApiError(400, "Invalid stageId");
    }
  
    if (!checklist_name?.trim()) {
      throw new ApiError(400, "checklist_name is required");
    }
  
    const created_by = req.user?._id;
    if (!created_by) {
      throw new ApiError(401, "Not authenticated");
    }
  
    const checklist = await Checklist.create({
      stage_id: stageId,
      created_by,
      checklist_name,
      description,
      status // optional; model defaults to 'draft'
    });
  
    return res
      .status(201)
      .json(new ApiResponse(201, checklist, "Checklist created successfully"));
  });
const listChecklistsForStage = asyncHandler(async (req, res) => {
  const { stageId } = req.params;

  if (!mongoose.isValidObjectId(stageId)) {
    throw new ApiError(400, "Invalid stageId");
  }

  const checklists = await Checklist.find({ stage_id: stageId }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, checklists, "Checklists fetched successfully"));
});
const getChecklistById = asyncHandler(async (req, res) => {
    const { id } = req.params
  
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid checklist id")
    }
  
    const checklist = await Checklist.findById(id)
    if (!checklist) {
      throw new ApiError(404, "Checklist not found")
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, checklist, "Checklist fetched successfully"))
  });
  const updateChecklist = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { checklist_name, description, status } = req.body;
  
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid checklist id");
    }
  
    // Only allow updating permitted fields
    const update = {};
    if (typeof checklist_name === "string") update.checklist_name = checklist_name;
    if (typeof description === "string") update.description = description;
    if (typeof status === "string") update.status = status; // enum validated by model
  
    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "No valid fields provided to update");
    }
  
    const checklist = await Checklist.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );
  
    if (!checklist) {
      throw new ApiError(404, "Checklist not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, checklist, "Checklist updated successfully"));
  });
  const deleteChecklist = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid checklist id");
    }
  
    const deleted = await Checklist.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, "Checklist not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Checklist deleted successfully"));
  });
  export { listChecklistsForStage, getChecklistById ,createChecklistForStage,updateChecklist,deleteChecklist};