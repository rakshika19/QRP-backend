import CheckPoint from "../models/checkpoint.model.js";

import Checklist from "../models/checklist.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createCheckPoint = asyncHandler(async (req, res) => {
  const { checkListId } = req.params;
  const { question } = req.body;

  if (!question) {
    throw new ApiError(400, "question is required");
  }

  const checklist = await Checklist.findById(checkListId);
  if (!checklist) {
    throw new ApiError(400, "checklistId is invalid");
  }

  const checkpoint = await CheckPoint.create({
    checklistId: checkListId,
    question,
    executorResponse: {},
    reviewerResponse: {},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, checkpoint, "Checkpoint created successfully"));
});

/**
 * UPDATE CHECKPOINT (PATCH)
 * PATCH /checkpoints/:checkpointId
 */
const updateCheckpointResponse = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;
  const { executorResponse, reviewerResponse } = req.body;

  const checkpoint = await CheckPoint.findById(checkpointId);
  if (!checkpoint) {
    throw new ApiError(404, "Checkpoint not found");
  }

  // 🧑‍🔧 EXECUTOR UPDATE
  if (executorResponse) {
    checkpoint.executorResponse = {
      ...checkpoint.executorResponse,
      ...executorResponse,
      respondedAt: new Date(),
    };
  }

  // 📷 EXECUTOR IMAGES (stored as Buffer)
  if (req.files?.length) {
    req.files.forEach((file) => {
      checkpoint.executorResponse.images.push({
        data: file.buffer,
        contentType: file.mimetype,
      });
    });
  }

  // 🧑‍💼 REVIEWER UPDATE
  if (reviewerResponse) {
    checkpoint.reviewerResponse = {
      ...checkpoint.reviewerResponse,
      ...reviewerResponse,
      reviewedAt: new Date(),
    };
  }

  await checkpoint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, checkpoint, "Checkpoint updated successfully"));
});

/**
 * DELETE CHECKPOINT
 * DELETE /checkpoints/:checkpointId
 */
const deleteCheckPoint = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;

  const checkpoint = await CheckPoint.findById(checkpointId);
  if (!checkpoint) {
    throw new ApiError(404, "checkpointId is invalid");
  }

  await checkpoint.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Checkpoint deleted successfully"));
});
const getCheckPointById = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;

  const checkpoint = await CheckPoint.findById(checkpointId);
  if (!checkpoint) {
    throw new ApiError(404, "Checkpoint not found");
  }

  return res.status(200).json(
    new ApiResponse(200, checkpoint, "Checkpoint fetched successfully")
  );
});

const getCheckpointsByChecklist = asyncHandler(async (req, res) => {
  const { checkListId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(checkListId)) {
    throw new ApiError(400, "Invalid checklistId");
  }

  const checklist = await Checklist.findById(checkListId).select("_id");
  if (!checklist) throw new ApiError(404, "Checklist not found");

  const checkpoints = await CheckPoint.find({ checklistId }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, checkpoints, "Checkpoints fetched successfully"));
});

export {
  createCheckPoint,
  updateCheckpointResponse,
  deleteCheckPoint,
    getCheckPointById,
    getCheckpointsByChecklist
};