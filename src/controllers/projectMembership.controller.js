import ProjectMembership from '../models/projectMembership.models.js';
import Project from '../models/project.models.js';
import { User } from '../models/user.models.js';

// Hardcoded roles
const VALID_ROLES = ['sdh', 'reviewer', 'executor'];

// GET /api/v1/projects/:id/members - Get project members
export const getProjectMembers = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Project ID from params:', id);
        
        // Check if project exists
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const members = await ProjectMembership.find({ project_id: id })
            .populate('user_id', 'username email');

        // Format response
        const formattedMembers = members.map(member => ({
            membershipId: member._id,
            userId: member.user_id._id,
            username: member.user_id.username,
            email: member.user_id.email,
            role: member.role,
            joinedAt: member.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                projectId: project._id,
                projectName: project.project_name,
                projectStatus: project.status,
                totalMembers: formattedMembers.length,
                members: formattedMembers
            }
        });
    } catch (error) {
        console.error('Error in getProjectMembers:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// POST /api/v1/projects/:id/members - Add member to project
export const addProjectMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, role } = req.body;

        // Validate role
        if (!role || !VALID_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role must be one of: ${VALID_ROLES.join(', ')}`
            });
        }

        // Check if project exists
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user exists
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already has a role in this project
        const existingMembership = await ProjectMembership.findOne({
            project_id: id,
            user_id: user_id
        });

        if (existingMembership) {
            return res.status(409).json({
                success: false,
                message: 'User already has a role in this project'
            });
        }

        const membership = await ProjectMembership.create({
            project_id: id,
            user_id: user_id,
            role: role
        });

        const populatedMembership = await ProjectMembership.findById(membership._id)
            .populate('user_id', 'username email');

        res.status(201).json({
            success: true,
            data: populatedMembership
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// PUT /api/v1/projects/:id/members/:userId - Update member role
export const updateProjectMember = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body;

        // Validate role
        if (!role || !VALID_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Role must be one of: ${VALID_ROLES.join(', ')}`
            });
        }

        const membership = await ProjectMembership.findOneAndUpdate(
            { project_id: id, user_id: userId },
            { role: role },
            { new: true }
        ).populate('user_id', 'username email');

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Project membership not found'
            });
        }

        res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE /api/v1/projects/:id/members/:userId - Remove member from project
export const removeProjectMember = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const membership = await ProjectMembership.findOneAndDelete({
            project_id: id,
            user_id: userId
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'Project membership not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Member removed from project successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET /api/v1/users/:id/projects - Get all projects for a user
export const getUserProjects = async (req, res) => {
    try {
        const { id } = req.params; // user id

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const projects = await ProjectMembership.find({ user_id: id })
            .populate('project_id', 'project_name status start_date end_date');

        res.status(200).json({
            success: true,
            data: {
                user: user.username,
                projects: projects
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};