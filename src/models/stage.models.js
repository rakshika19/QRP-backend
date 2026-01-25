import mongoose from "mongoose";

const stageSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    stage_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revision_number: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Stage = mongoose.model("Stage", stageSchema);


export default Stage;
