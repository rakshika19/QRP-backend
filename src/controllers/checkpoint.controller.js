import CheckPoint from "../models/checkpoint.model.js";
import CheckPointTransaction from "../models/checkpointTransaction.models.js";
import mongoose from "mongoose";

// import Checklist from "../models/checklist.models.js";
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


/* =====================================================
   GET CHECKPOINTS BY CHECKLIST ID (WITHOUT IMAGES)
===================================================== */
const getCheckpointsByChecklistId = asyncHandler(async (req, res) => {
  const { checkListId } = req.params;

  if (!mongoose.isValidObjectId(checkListId)) {
    throw new ApiError(400, "Invalid checklist id");
  }

  // ✅ Exclude images from both executor and reviewer responses
  const checkpoints = await CheckPoint.find({ checklistId: checkListId })
    .select('-executorResponse.images -reviewerResponse.images')
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, checkpoints, "Checkpoints fetched successfully"));
});

/* =====================================================
   GET CHECKPOINT BY ID (WITHOUT IMAGES)
===================================================== */
const getCheckPointById = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;

  if (!mongoose.isValidObjectId(checkpointId)) {
    throw new ApiError(400, "Invalid checkpoint id");
  }

  // ✅ Exclude images
  const checkpoint = await CheckPoint.findById(checkpointId)
    .select('-executorResponse.images -reviewerResponse.images');

  if (!checkpoint) {
    throw new ApiError(404, "Checkpoint not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, checkpoint, "Checkpoint fetched successfully"));
});

/* =====================================================
   SAVE CHECKPOINT (PATCH)
   PATCH /checkpoints/:checkpointId/save
===================================================== */

// for executor and reviewer to save progress with images
const saveCheckpoint = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;
  const { executorResponse } = req.body;

  if (!mongoose.isValidObjectId(checkpointId)) {
    throw new ApiError(400, "Invalid checkpoint id");
  }

  const checkpoint = await CheckPoint.findById(checkpointId);
  if (!checkpoint) {
    throw new ApiError(404, "Checkpoint not found");
  }

  // Save executor response
  if (executorResponse) {
    checkpoint.executorResponse = {
      ...checkpoint.executorResponse,
      ...executorResponse,
      respondedAt: new Date(),
    };
  }

  // Handle uploaded images
  if (req.files?.length) {
    if (!checkpoint.executorResponse.images) {
      checkpoint.executorResponse.images = [];
    }
    req.files.forEach((file) => {
      checkpoint.executorResponse.images.push({
        data: file.buffer,
        contentType: file.mimetype,
      });
    });
  }

  await checkpoint.save();

  return res
    .status(200)
    .json(new ApiResponse(200, checkpoint, "Checkpoint saved successfully"));
});

/**
 * GET IMAGES
 * POST /checkpoints/images
 * Fetches all images from either current checkpoint response or transaction history
 */
const getImages = asyncHandler(async (req, res) => {
  const { id, type, responseType } = req.body;

  if (!id || !type || !responseType) {
    throw new ApiError(400, "Missing required fields: id, type, responseType");
  }

  if (!["current", "history"].includes(type)) {
    throw new ApiError(400, "type must be 'current' or 'history'");
  }

  if (!["executorResponse", "reviewerResponse"].includes(responseType)) {
    throw new ApiError(400, "responseType must be 'executorResponse' or 'reviewerResponse'");
  }

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid id format");
  }

  let document;

  if (type === "current") {
    document = await CheckPoint.findById(id)
      .select(`+${responseType}.images.data`);
  } else if (type === "history") {
    document = await CheckPointTransaction.findById(id)
      .select(`+${responseType}.images.data`);
  }

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const response = document[responseType];
  const images = response?.images || [];

  if (images.length === 0) {
    throw new ApiError(404, "No images found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, images, "Images fetched successfully"));
});

// Update export
export {
  createCheckPoint,
  getCheckpointsByChecklistId,
  updateCheckpointResponse,
  deleteCheckPoint,
  getCheckPointById,
  saveCheckpoint,
  getImages,
};