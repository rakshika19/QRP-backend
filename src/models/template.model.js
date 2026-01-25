import mongoose from "mongoose";

/**
 * Checkpoint (has its own _id)
 */
const checkpointSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
});

/**
 * SubTopic (has its own _id)
 */
const subTopicSchema = new mongoose.Schema({
  subTopicName: {
    type: String,
    required: true,
    trim: true,
  },

  checkpoints: {
    type: [checkpointSchema],
    default: [],
  },
});

/**
 * Stage (has its own _id)
 */
const stageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    trim: true,
  },

  subTopics: {
    type: [subTopicSchema],
    default: [],
  },
});

/**
 * Template (root)
 */
const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    stages: {
      type: [stageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);
export default Template;
