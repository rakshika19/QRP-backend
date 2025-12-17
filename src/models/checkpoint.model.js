import mongoose from "mongoose";

const checkpointSchema = new mongoose.Schema(
  {
    checklistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    executorResponse: {
      answer: {
        type: Boolean,
        default: null,
      },
      images: [
        {
          data: Buffer,
          contentType: String,
        },
      ],
      remark: {
        type: String,
        trim: true,
      },
      respondedAt: Date,
    },

    reviewerResponse: {
      answer: {
        type: Boolean,
        default: null,
      },
      images: [
        {
          data: Buffer,
          contentType: String,
        },
      ],
      remark: String,
      reviewedAt: Date,
    },
  },
  { timestamps: true }
);


const CheckPoint =mongoose.model("Checkpoint", checkpointSchema);

export default CheckPoint;