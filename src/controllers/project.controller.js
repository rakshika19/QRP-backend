import Project from '../models/project.models.js';
import Stage from '../models/stage.models.js';
import SubTopic from '../models/subtopic.models.js';
import CheckPoint from '../models/checkpoint.model.js';
import Template from '../models/template.model.js';

// Get all projects
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('created_by', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get project by ID
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('created_by', 'name email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Get all stages for this project
        const stages = await Stage.find({ project_id: project._id });
        
        const stagesWithName = stages.map(stage => ({
            _id: stage._id,
            stage_name: stage.stage_name,
            status: stage.status
        }));
        
        res.status(200).json({
            success: true,
            data: {
                ...project.toObject(),
                stages: stagesWithName
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new project
export const createProject = async (req, res) => {
    try {
        const { project_name, start_date } = req.body;
        const createdByUser = req.user._id;
        
        const project = await Project.create({
            project_name,
            start_date,
            status: "pending",  // Always "pending" on creation
            end_date: null,     // Default to null
            created_by: createdByUser
        });
        
        // Populate the created project
        const populatedProject = await Project.findById(project._id)
            .populate('created_by', 'username email');
        
        res.status(201).json({
            success: true,
            data: populatedProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update project
export const updateProject = async (req, res) => {
    try {
        const { project_name, status, start_date, end_date } = req.body;
        
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { project_name, status, start_date, end_date },
            { new: true }
        ).populate('created_by', 'name email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




export const startProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { template_id } = req.body;
        const userId = req.user._id;

        // Validate project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if project is already started
        if (project.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Project has already been started'
            });
        }

        // Fetch template from database
        const template = await Template.findById(template_id);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Validate template has stages
        if (!template.stages || !Array.isArray(template.stages) || template.stages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Template has no stages defined'
            });
        }

        // Create stages, subtopics, and checkpoints
        for (const stageData of template.stages) {
            // Create stage
            const stage = await Stage.create({
                project_id: projectId,
                stage_name: stageData.stageName,
                status: 'NOT_STARTED',
                created_by: userId,
                revision_number: 0
            });

            // Create subtopics for this stage
            if (stageData.subTopics && Array.isArray(stageData.subTopics)) {
                for (const subTopicData of stageData.subTopics) {
                    const subTopic = await SubTopic.create({
                        name: subTopicData.subTopicName,
                        stage: stage._id
                    });

                    // Create checkpoints for this subtopic
                    if (subTopicData.checkpoints && Array.isArray(subTopicData.checkpoints)) {
                        for (const checkpointData of subTopicData.checkpoints) {
                            await CheckPoint.create({
                                SubTopic: subTopic._id,
                                question: checkpointData.text,
                                current_status: 'PENDING'
                            });
                        }
                    }
                }
            }
        }

        // Update project status to "in_progress"
        project.status = 'in_progress';
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project started successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};