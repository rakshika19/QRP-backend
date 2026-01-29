import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Stage from "../models/stage.models.js";
import Project from "../models/project.models.js";
import SubTopic from "../models/subtopic.models.js";
import CheckPoint from "../models/checkpoint.model.js";
import CheckPointTransaction from "../models/checkpointTransaction.models.js";

const listStagesForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  const stages = await Stage.find({ project_id: projectId }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, stages, "Stages fetched successfully"));
});

const getStageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid stage id");
  }

  const stage = await Stage.findById(id);
  if (!stage) {
    throw new ApiError(404, "Stage not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, stage, "Stage fetched successfully"));
});

const createStage = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { stage_name } = req.body;
  
    if (!mongoose.isValidObjectId(projectId)) {
      throw new ApiError(400, "Invalid projectId");
    }
  
    if (!stage_name?.trim()) {
      throw new ApiError(400, "stage_name is required");
    }
  
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
  
    // Check if stage with same name already exists for this project
    const existingStage = await Stage.findOne({
      project_id: projectId,
      stage_name: stage_name.trim()
    });
    if (existingStage) {
      throw new ApiError(409, "Stage with this name already exists in the project");
    }
  
    // created_by is required by the model; must be authenticated
    const created_by = req.user?._id;
    if (!created_by) {
      throw new ApiError(401, "Not authenticated");
    }
  
    const stage = await Stage.create({
      project_id: projectId,
      stage_name,
      status: "NOT_STARTED", // default status
      created_by,
      revision_number: 0 // default revision number
    });
  
    return res
      .status(201)
      .json(new ApiResponse(201, stage, "Stage created successfully"));
  });
  const updateStage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stage_name, status } = req.body;
  
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid stage id");
    }
  
    // Only allow updating permitted fields
    const update = {};
    if (typeof stage_name === "string") update.stage_name = stage_name;
    if (typeof status === "string") update.status = status;
  
    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "No valid fields provided to update");
    }
  
    const stage = await Stage.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );
  
    if (!stage) {
      throw new ApiError(404, "Stage not found");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, stage, "Stage updated successfully"));
  });
  const deleteStage = asyncHandler(async (req, res) => {
    const { id } = req.params
  
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid stage id")
    }
  
    const deleted = await Stage.findByIdAndDelete(id)
    if (!deleted) {
      throw new ApiError(404, "Stage not found")
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Stage deleted successfully"))
  })

const submitStageForReview = asyncHandler(async (req, res) => {
  const { stageId } = req.params;

  if (!mongoose.isValidObjectId(stageId)) {
    throw new ApiError(400, "Invalid stage id");
  }

  const stage = await Stage.findById(stageId);
  if (!stage) {
    throw new ApiError(404, "Stage not found");
  }

  // Check if stage is in DRAFT status before submitting for review
  if (stage.status !== "NOT_STARTED" && stage.status !== "COMPLETED") {
    throw new ApiError(400, `Cannot submit stage with status: ${stage.status}`);
  }

  // Update stage status to IN_REVIEW
  stage.status = "IN_REVIEW";
  await stage.save();

  return res
    .status(200)
    .json(new ApiResponse(200, stage, "Stage submitted for review successfully"));
});

const reviewDecision = asyncHandler(async (req, res) => {
  const { stageId } = req.params;
  const { status } = req.query; // DRAFT or COMPLETED
  const reviewerId = req.user._id;

  if (!mongoose.isValidObjectId(stageId)) {
    throw new ApiError(400, "Invalid stage id");
  }

  // Validate status query parameter
  if (!status || !["DRAFT", "COMPLETED"].includes(status.toUpperCase())) {
    throw new ApiError(400, "Status must be either 'DRAFT' or 'COMPLETED'");
  }

  const finalStatus = status.toUpperCase();

  const stage = await Stage.findById(stageId);
  if (!stage) {
    throw new ApiError(404, "Stage not found");
  }

  // Check if stage is in IN_REVIEW status
  if (stage.status !== "IN_REVIEW") {
    throw new ApiError(400, `Stage must be in IN_REVIEW status. Current status: ${stage.status}`);
  }

  // Get all subtopics for this stage
  const subtopics = await SubTopic.find({ stage: stageId });

  // Get all checkpoints for all subtopics
  const subtopicIds = subtopics.map(st => st._id);
  const checkpoints = await CheckPoint.find({ SubTopic: { $in: subtopicIds } });

  // Create transactions for each checkpoint
  const transactions = [];
  for (const checkpoint of checkpoints) {
    // Get the latest iteration number for this checkpoint
    const lastTransaction = await CheckPointTransaction
      .findOne({ checkpointId: checkpoint._id })
      .sort({ iteration: -1 });
    
    const nextIteration = lastTransaction ? lastTransaction.iteration + 1 : 1;

    // Compare executor and reviewer responses
    const executorAnswer = checkpoint.executorResponse?.answer;
    const reviewerAnswer = checkpoint.reviewerResponse?.answer;
    
    // Determine review outcome
    let review_outcome;
    if (executorAnswer === reviewerAnswer && executorAnswer !== null && executorAnswer !== undefined) {
      review_outcome = "APPROVED";
    } else {
      review_outcome = "CHANGES_REQUIRED";
    }

    // Get executorId from checkpoint's executorResponse or use stage creator
    const executorId = checkpoint.executorResponse?.executorId || stage.created_by;

    // Create transaction
    const transaction = await CheckPointTransaction.create({
      checkpointId: checkpoint._id,
      iteration: nextIteration,
      review_outcome,
      executorResponse: checkpoint.executorResponse || {},
      reviewerResponse: checkpoint.reviewerResponse || {},
      executorId: executorId,
      reviewerId: reviewerId
    });

    transactions.push(transaction);
  }

  // Update stage status based on review decision
  stage.status = finalStatus;
  
  // Increment revision number if sent back to DRAFT
  if (finalStatus === "DRAFT") {
    stage.revision_number += 1;
  }

  await stage.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {
      stage,
      transactionsCreated: transactions.length,
      transactions
    }, `Stage ${finalStatus === "DRAFT" ? "sent back to draft" : "completed"} successfully`));
});

const getStageInfo = asyncHandler(async (req, res) => {
  const { stageId } = req.params;

  if (!mongoose.isValidObjectId(stageId)) {
    throw new ApiError(400, "Invalid stage id");
  }

  // Get stage details
  const stage = await Stage.findById(stageId);
  if (!stage) {
    throw new ApiError(404, "Stage not found");
  }

  // Get all subtopics for this stage
  const subtopics = await SubTopic.find({ stage: stageId });

  // Build complete stage info with subtopics, checkpoints, and history
  const stageInfo = {
    _id: stage._id,
    stage_name: stage.stage_name,
    status: stage.status,
    project_id: stage.project_id,
    created_by: stage.created_by,
    revision_number: stage.revision_number,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
    subtopics: []
  };

  for (const subtopic of subtopics) {
    // Get all checkpoints for this subtopic (exclude image buffer)
    const checkpoints = await CheckPoint.find({ SubTopic: subtopic._id })
      .select('-executorResponse.images.data -reviewerResponse.images.data');

    const checkpointsWithHistory = [];

    for (const checkpoint of checkpoints) {
      // Get all transaction history for this checkpoint (exclude image buffer)
      const history = await CheckPointTransaction.find({ checkpointId: checkpoint._id })
        .select('-executorResponse.images.data -reviewerResponse.images.data')
        .sort({ iteration: 1 });

      checkpointsWithHistory.push({
        _id: checkpoint._id,
        question: checkpoint.question,
        current_status: checkpoint.current_status,
        executorResponse: checkpoint.executorResponse,
        reviewerResponse: checkpoint.reviewerResponse,
        history: history
      });
    }

    stageInfo.subtopics.push({
      _id: subtopic._id,
      name: subtopic.name,
      checkpoints: checkpointsWithHistory
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, stageInfo, "Stage info fetched successfully"));
});

export { listStagesForProject, getStageById, createStage, updateStage, deleteStage, submitStageForReview, reviewDecision, getStageInfo };