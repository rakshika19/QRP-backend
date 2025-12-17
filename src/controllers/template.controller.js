// import Template from "../models/template.model.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// // Create a new template
// export const createTemplate = asyncHandler(async (req, res) => {
//   const { name, stage1, stage2, stage3 } = req.body;

//   if (!name) {
//     throw new ApiError(400, "Template name is required");
//   }

//   const template = new Template({
//     name,
//     stage1: stage1 || [],
//     stage2: stage2 || [],
//     stage3: stage3 || [],
//   });

//   await template.save();

//   return res
//     .status(201)
//     .json(new ApiResponse(201, template, "Template created successfully"));
// });

// // Get all templates or a specific template by ID
// export const getTemplate = asyncHandler(async (req, res) => {
//   const { id } = req.query;

//   if (id) {
//     const template = await Template.findById(id);
//     if (!template) {
//       throw new ApiError(404, "Template not found");
//     }
//     return res
//       .status(200)
//       .json(new ApiResponse(200, template, "Template fetched successfully"));
//   }

//   const templates = await Template.find();
//   return res
//     .status(200)
//     .json(new ApiResponse(200, templates, "All templates fetched successfully"));
// });

// // Edit an existing template
// export const editTemplate = asyncHandler(async (req, res) => {
//   const { id } = req.query;
//   const { name, stage1, stage2, stage3 } = req.body;

//   if (!id) {
//     throw new ApiError(400, "Template ID is required");
//   }

//   const template = await Template.findByIdAndUpdate(
//     id,
//     { name, stage1, stage2, stage3 },
//     { new: true, runValidators: true }
//   );

//   if (!template) {
//     throw new ApiError(404, "Template not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, template, "Template updated successfully"));
// });

// // Delete a template
// export const deleteTemplate = asyncHandler(async (req, res) => {
//   const { id } = req.query;

//   if (!id) {
//     throw new ApiError(400, "Template ID is required");
//   }

//   const template = await Template.findByIdAndDelete(id);

//   if (!template) {
//     throw new ApiError(404, "Template not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Template deleted successfully"));
// });


import Template from "../models/template.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

/**
 * CREATE TEMPLATE (only once)
 */
export const createTemplate = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Template name is required");
  }

  const exists = await Template.findOne();
  if (exists) {
    throw new ApiError(400, "Template already exists");
  }

  const template = await Template.create({ name });

  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template created"));
});

/**
 * GET TEMPLATE
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne();
  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template fetched"));
});

/**
 * ADD CHECKLIST
 */
export const addChecklist = asyncHandler(async (req, res) => {
  const { stage, text } = req.body;

  if (!stage || !text) {
    throw new ApiError(400, "stage and text are required");
  }

  if (!["stage1", "stage2", "stage3"].includes(stage)) {
    throw new ApiError(400, "Invalid stage");
  }

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  template[stage].push({ text, checkpoints: [] });

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checklist added"));
});

/**
 * UPDATE CHECKLIST TEXT
 */
export const updateChecklist = asyncHandler(async (req, res) => {
  const { checklistId } = req.params;
  const { stage, text } = req.body;

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  const checklist = template[stage]?.id(checklistId);
  if (!checklist) throw new ApiError(404, "Checklist not found");

  checklist.text = text ?? checklist.text;

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checklist updated"));
});

/**
 * DELETE CHECKLIST
 */
export const deleteChecklist = asyncHandler(async (req, res) => {
  const { checklistId } = req.params;
  const { stage } = req.body;

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  template[stage].id(checklistId)?.remove();

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Checklist deleted"));
});

/**
 * ADD CHECKPOINT
 */
export const addCheckpoint = asyncHandler(async (req, res) => {
  const { checklistId } = req.params;
  const { stage, text } = req.body;

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  const checklist = template[stage]?.id(checklistId);
  if (!checklist) throw new ApiError(404, "Checklist not found");

  checklist.checkpoints.push({ text });

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checkpoint added"));
});

/**
 * UPDATE CHECKPOINT TEXT
 */
export const updateCheckpoint = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;
  const { stage, checklistId, text } = req.body;

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  const checklist = template[stage]?.id(checklistId);
  const checkpoint = checklist?.checkpoints.id(checkpointId);

  if (!checkpoint) throw new ApiError(404, "Checkpoint not found");

  checkpoint.text = text ?? checkpoint.text;

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Checkpoint updated"));
});

/**
 * DELETE CHECKPOINT
 */
export const deleteCheckpoint = asyncHandler(async (req, res) => {
  const { checkpointId } = req.params;
  const { stage, checklistId } = req.body;

  const template = await Template.findOne();
  if (!template) throw new ApiError(404, "Template not found");

  const checklist = template[stage]?.id(checklistId);
  checklist?.checkpoints.id(checkpointId)?.remove();

  await template.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Checkpoint deleted"));
});