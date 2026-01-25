import mongoose from 'mongoose';

const SubTopicSchema = new mongoose.Schema({
  

    name:{
        type: String,
        required: true,
        trim: true,

    },
     stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
    },
}, {
 
    timestamps: true
});

const SubTopic = mongoose.model('SubTopic', SubTopicSchema);

export default SubTopic;