import Template from "../models/template.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * CREATE TEMPLATE
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Template name is required");
  }

  const existing = await Template.findOne();
  if (existing) {
    throw new ApiError(400, "Template already exists");
  }

  const template = await Template.create({
    name,
    stages: [],
  });
  

  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template created successfully"));
});

/**
 * GET ALL TEMPLATES
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne();  // ✅ Changed from find()
  
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template fetched successfully"));
});

/**
 * ADD STAGE
 */
export const addStage = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const { stageName } = req.body;

  if (!stageName) {
    throw new ApiError(400, "stageName is required");
  }

  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }
  const exists = template.stages.some(
    s => s.stageName.toLowerCase() === stageName.toLowerCase()
  );

  if (exists) {
    throw new ApiError(400, "Stage already exists");
  }

  template.stages.push({
    stageName,
    subTopics: [],
  });

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Stage added successfully"));
});

/**
 * ADD SUBTOPIC (using stageIndex)
 */
export const addSubtopic = asyncHandler(async (req, res) => {
  const { templateId, stageId } = req.params;
  const { subTopicName } = req.body;

  if (!subTopicName) {
    throw new ApiError(400, "subTopicName is required");
  }

  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  const stage = template.stages.id(stageId);
  if (!stage) {
    throw new ApiError(404, "Stage not found");
  }

  stage.subTopics.push({
    subTopicName,
    checkpoints: [],
  });

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "SubTopic added successfully"));
});


/**
 * ADD CHECKPOINT (using stageIndex + subTopicIndex)
 */
export const addCheckpoint = asyncHandler(async (req, res) => {
  const { templateId, stageId, subTopicId } = req.params;
  const { checkpoint } = req.body;

  if (!checkpoint) {
    throw new ApiError(400, "Checkpoint text is required");
  }

  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  const stage = template.stages.id(stageId);
  if (!stage) {
    throw new ApiError(400, "Invalid stage index");
  }

  const subTopic = stage.subTopics.id(subTopicId);
  if (!subTopic) {
    throw new ApiError(400, "Invalid subTopic index");
  }

  subTopic.checkpoints.push(checkpoint);

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checkpoint added successfully"));
});

export const deleteSubtopic = asyncHandler(async (req, res) => {
  const { templateId, stageIndex, subTopicIndex } = req.params;

  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  if (stageIndex < 0 || stageIndex >= template.stages.length) {
    throw new ApiError(400, "Invalid stage index");
  }

  if (subTopicIndex < 0 || subTopicIndex >= template.stages[stageIndex].subTopics.length) {
    throw new ApiError(400, "Invalid subTopic index");
  }

  template.stages[stageIndex].subTopics.splice(subTopicIndex, 1);

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "SubTopic deleted successfully"));
});

export const deleteCheckpoint = asyncHandler(async (req, res) => {
  const { templateId, stageIndex, subTopicIndex, checkpointIndex } = req.params;

  const template = await Template.findById(templateId);
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  const stage = template.stages[stageIndex];
  if (!stage) {
    throw new ApiError(400, "Invalid stage index");
  }

  const subTopic = stage.subTopics[subTopicIndex];
  if (!subTopic) {
    throw new ApiError(400, "Invalid subTopic index");
  }

  if (checkpointIndex < 0 || checkpointIndex >= subTopic.checkpoints.length) {
    throw new ApiError(400, "Invalid checkpoint index");
  }

  subTopic.checkpoints.splice(checkpointIndex, 1);

  await template.save();
  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checkpoint deleted successfully"));
});