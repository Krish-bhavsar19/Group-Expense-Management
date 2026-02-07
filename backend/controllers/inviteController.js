const Group = require('../models/Group');
const JoinRequest = require('../models/JoinRequest');
const GroupMember = require('../models/GroupMember');

// @desc    Get group info by invite code (public)
// @route   GET /api/invite/:inviteCode
// @access  Public
const getGroupByInviteCode = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const group = await Group.findByInviteCode(inviteCode);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite link'
            });
        }

        // Return basic group info (don't expose sensitive data)
        res.status(200).json({
            success: true,
            data: {
                id: group.id,
                name: group.name,
                description: group.description,
                creator_name: group.creator_name,
                member_count: group.member_count
            }
        });
    } catch (error) {
        console.error('Get group by invite code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group information',
            error: error.message
        });
    }
};

// @desc    Send join request
// @route   POST /api/invite/:inviteCode/request
// @access  Private
const sendJoinRequest = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user.id;

        // Get group by invite code
        const group = await Group.findByInviteCode(inviteCode);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite link'
            });
        }

        // Check if user is already a member
        const isMember = await GroupMember.isUserMember(group.id, userId);
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        // Create join request
        const request = await JoinRequest.createRequest(group.id, userId);

        res.status(201).json({
            success: true,
            message: 'Join request sent successfully. Waiting for admin approval.',
            data: request
        });
    } catch (error) {
        console.error('Send join request error:', error);

        if (error.message.includes('already')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send join request',
            error: error.message
        });
    }
};

// @desc    Get pending join requests for a group
// @route   GET /api/groups/:id/requests
// @access  Private (admin only)
const getPendingRequests = async (req, res) => {
    try {
        const groupId = req.params.id;
        const requests = await JoinRequest.getPendingRequests(groupId);

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending requests',
            error: error.message
        });
    }
};

// @desc    Approve join request
// @route   POST /api/groups/:id/requests/:requestId/approve
// @access  Private (admin only)
const approveJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user.id;

        await JoinRequest.approveRequest(requestId, adminId);

        res.status(200).json({
            success: true,
            message: 'Join request approved successfully'
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve request',
            error: error.message
        });
    }
};

// @desc    Reject join request
// @route   POST /api/groups/:id/requests/:requestId/reject
// @access  Private (admin only)
const rejectJoinRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminId = req.user.id;

        await JoinRequest.rejectRequest(requestId, adminId);

        res.status(200).json({
            success: true,
            message: 'Join request rejected'
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject request',
            error: error.message
        });
    }
};

// @desc    Check user's request status for a group
// @route   GET /api/groups/:id/my-request
// @access  Private
const getMyRequestStatus = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        const request = await JoinRequest.getUserRequest(groupId, userId);

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get my request status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check request status',
            error: error.message
        });
    }
};

module.exports = {
    getGroupByInviteCode,
    sendJoinRequest,
    getPendingRequests,
    approveJoinRequest,
    rejectJoinRequest,
    getMyRequestStatus
};
