import mongoose from 'mongoose';

const projectMembershipSchema = new mongoose.Schema({
   
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

   
    role: {
        type: String,
        enum:['sdh', 'executor', 'reviewer'],
         required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});


projectMembershipSchema.index({ project_id: 1, user_id: 1, role: 1 }, { unique: true });

const ProjectMembership = mongoose.model('ProjectMembership', projectMembershipSchema);

export default ProjectMembership;
