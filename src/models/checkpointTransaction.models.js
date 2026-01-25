import mongoose from "mongoose";



const checkPointTransactionSchema = new mongoose.Schema(
  {
      

    checkpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checkpoint",
      required: true,
    },
    iteration: {
      type: Number,
      required: true,
    },

    // FINAL result of this iteration
    review_outcome: {
      type: String,
      enum: ["APPROVED", "CHANGES_REQUIRED"],
      required: true,
    },

    executorResponse: responseSchema,
    reviewerResponse: responseSchema,

    executorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


const responseSchema = new mongoose.Schema(
    {
        answer: {
            type: Boolean, // true = YES, false = NO
            default: null,
        },
        
    remark: {
      type: String,
      trim: true,
    },

    images: [
      {
        data: {
          type: Buffer,     // image binary
          select: false,    // 🔥 do NOT fetch by default
        },
        contentType: {
          type: String,     // image/png, image/jpeg
        },
      },
    ],

    respondedAt: {
      type: Date,
    },
  },
  { _id: false }
);


const CheckPointTransaction = mongoose.model(
  "CheckPointTransaction",
  checkPointTransactionSchema
  
);
export default CheckPointTransaction;
