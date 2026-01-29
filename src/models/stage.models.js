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
    status: {
      type: String,
      enum: ["NOT_STARTED", "DRAFT", "IN_REVIEW","COMPLETED"],
      default: "NOT_STARTED",
     
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
