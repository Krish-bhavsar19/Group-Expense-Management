const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        // Create group
        const group = await Group.create({
            name,
            description: description || '',
            createdBy: userId
        });

        // Add creator as admin
        await GroupMember.addMember(group.id, userId, 'admin');

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: group
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create group',
            error: error.message
        });
    }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await Group.getUserGroups(userId);

        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        console.error('Get user groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch groups',
            error: error.message
        });
    }
};

// @desc    Get group details
// @route   GET /api/groups/:id
// @access  Private (members only)
const getGroupDetails = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Get members
        const members = await GroupMember.getGroupMembers(groupId);

        res.status(200).json({
            success: true,
            data: {
                ...group,
                members
            }
        });
    } catch (error) {
        console.error('Get group details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group details',
            error: error.message
        });
    }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (admin only)
const updateGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        const group = await Group.update(groupId, { name, description });

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            data: group
        });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group',
            error: error.message
        });
    }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (admin only)
const deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        await Group.delete(groupId);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete group',
            error: error.message
        });
    }
};

// @desc    Get group members
// @route   GET /api/groups/:id/members
// @access  Private (members only)
const getGroupMembers = async (req, res) => {
    try {
        const groupId = req.params.id;
        const members = await GroupMember.getGroupMembers(groupId);

        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group members',
            error: error.message
        });
    }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (admin only)
const removeMember = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userIdToRemove = req.params.userId;
        const adminId = req.user.id;

        // Prevent admin from removing themselves
        if (adminId === parseInt(userIdToRemove)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot remove yourself. Use leave group instead.'
            });
        }

        await GroupMember.removeMember(groupId, userIdToRemove);

        res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove member',
            error: error.message
        });
    }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private (members only)
const leaveGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        // Check if user is the only admin
        const members = await GroupMember.getGroupMembers(groupId);
        const admins = members.filter(m => m.role === 'admin');

        if (admins.length === 1 && admins[0].user_id === userId) {
            return res.status(400).json({
                success: false,
                message: 'You are the only admin. Please assign another admin or delete the group.'
            });
        }

        await GroupMember.removeMember(groupId, userId);

        res.status(200).json({
            success: true,
            message: 'You have left the group'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave group',
            error: error.message
        });
    }
};

// @desc    Regenerate invite code
// @route   POST /api/groups/:id/regenerate-invite
// @access  Private (admin only)
const regenerateInviteCode = async (req, res) => {
    try {
        const groupId = req.params.id;
        const group = await Group.regenerateInviteCode(groupId);

        res.status(200).json({
            success: true,
            message: 'Invite code regenerated successfully',
            data: {
                invite_code: group.invite_code
            }
        });
    } catch (error) {
        console.error('Regenerate invite code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to regenerate invite code',
            error: error.message
        });
    }
};

module.exports = {
    createGroup,
    getUserGroups,
    getGroupDetails,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    removeMember,
    leaveGroup,
    regenerateInviteCode
};
