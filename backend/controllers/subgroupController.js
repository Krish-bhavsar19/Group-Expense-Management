const Subgroup = require('../models/Subgroup');
const GroupMember = require('../models/GroupMember');

// Create a new subgroup
const createSubgroup = async (req, res) => {
    try {
        const { groupId, name, description, members } = req.body;
        const userId = req.user.id;

        // Verify user is member of the main group
        const isMember = await GroupMember.isUserMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of the group to create a subgroup'
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Subgroup name is required'
            });
        }

        // Create subgroup
        const subgroup = await Subgroup.create({
            groupId,
            name,
            description,
            createdBy: userId
        });

        // Add creator to subgroup automatically
        await Subgroup.addMember(subgroup.id, userId);

        // Add other members if provided
        if (members && Array.isArray(members)) {
            for (const memberId of members) {
                // Verify member belongs to main group
                const isGroupMember = await GroupMember.isUserMember(groupId, memberId);
                if (isGroupMember && memberId !== userId) {
                    await Subgroup.addMember(subgroup.id, memberId);
                }
            }
        }

        // Fetch complete subgroup details
        const completeSubgroup = await Subgroup.findById(subgroup.id);

        res.status(201).json({
            success: true,
            message: 'Subgroup created successfully',
            data: completeSubgroup
        });

    } catch (error) {
        console.error('Create subgroup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subgroup',
            error: error.message
        });
    }
};

// Get all subgroups for a group
const getGroupSubgroups = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Verify user is member of the main group
        const isMember = await GroupMember.isUserMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this group'
            });
        }

        const subgroups = await Subgroup.getByGroupId(groupId, userId);

        res.json({
            success: true,
            data: subgroups
        });
    } catch (error) {
        console.error('Get subgroups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve subgroups',
            error: error.message
        });
    }
};

// Get subgroup details
const getSubgroup = async (req, res) => {
    try {
        const { id } = req.params;
        // Ideally enforce that user is member of MAIN group
        const subgroup = await Subgroup.findById(id);

        if (!subgroup) {
            return res.status(404).json({
                success: false,
                message: 'Subgroup not found'
            });
        }

        res.json({
            success: true,
            data: subgroup
        });
    } catch (error) {
        console.error('Get subgroup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve subgroup',
            error: error.message
        });
    }
};

// Delete subgroup
const deleteSubgroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const subgroup = await Subgroup.findById(id);
        if (!subgroup) {
            return res.status(404).json({
                success: false,
                message: 'Subgroup not found'
            });
        }

        // Only creator can delete
        if (subgroup.created_by !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete this subgroup'
            });
        }

        await Subgroup.delete(id);

        res.json({
            success: true,
            message: 'Subgroup deleted successfully'
        });
    } catch (error) {
        console.error('Delete subgroup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subgroup',
            error: error.message
        });
    }
};

module.exports = {
    createSubgroup,
    getGroupSubgroups,
    getSubgroup,
    deleteSubgroup
};
