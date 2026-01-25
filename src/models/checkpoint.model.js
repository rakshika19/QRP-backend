import mongoose from "mongoose";
// import SubTopic from "./subtopic.models.js";



const checkpointSchema = new mongoose.Schema(
  {
    SubTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTopic",
      required: true,
    }, 
  question: {
    type: String,
    required: true,
  },
  current_status: {
  type: String,
  enum: ["PENDING", "APPROVED", "CHANGES_REQUIRED"],
  required: true
},

  executorResponse: responseSchema,
  reviewerResponse: responseSchema,

},
  { timestamps: true }
);


const CheckPoint =mongoose.model("Checkpoint", checkpointSchema);


const responseSchema = new mongoose.Schema({
  answer: {
    type: Boolean,      
    default: null,
  },

  remark: {
    type: String,
    trim: true,
  },

  images: [
    {
      data: {
        type: Buffer,
        select: false,   
      },
      contentType: {
        type: String,
      },
    },
  ],

  respondedAt: {
    type: Date,
  },
});
export default CheckPoint;