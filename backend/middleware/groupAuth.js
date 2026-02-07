const GroupMember = require('../models/GroupMember');

// Check if user is a member of the group
const isGroupMember = async (req, res, next) => {
    try {
        const groupId = req.params.id || req.params.groupId;
        const userId = req.user.id;

        const isMember = await GroupMember.isUserMember(groupId, userId);

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking group membership',
            error: error.message
        });
    }
};

// Check if user is an admin of the group
const isGroupAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.id || req.params.groupId;
        const userId = req.user.id;

        const isAdmin = await GroupMember.isUserAdmin(groupId, userId);

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only group admins can perform this action'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking admin status',
            error: error.message
        });
    }
};

// Check if user is NOT a member (for join requests)
const isNotGroupMember = async (req, res, next) => {
    try {
        const groupId = req.params.groupId || req.body.groupId;
        const userId = req.user.id;

        const isMember = await GroupMember.isUserMember(groupId, userId);

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking group membership',
            error: error.message
        });
    }
};

module.exports = {
    isGroupMember,
    isGroupAdmin,
    isNotGroupMember
};
