import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    stages: {
      type: [
        {
          stageName: {
            type: String,
            required: true,
            trim: true,
          },

          subTopics: {
            type: [
              {
                subTopic: {
                  type: String,
                  required: true,
                  trim: true,
                },

                // ✅ checkpoints belong to subTopic
                checkpoints: {
                  type: [String], // just text
                  default: [],
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);
export default Template;
