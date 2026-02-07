const express = require('express');
const router = express.Router();
const {
    createGroup,
    getUserGroups,
    getGroupDetails,
    updateGroup,
    deleteGroup,
    getGroupMembers,
    removeMember,
    leaveGroup,
    regenerateInviteCode
} = require('../controllers/groupController');
const {
    getPendingRequests,
    approveJoinRequest,
    rejectJoinRequest,
    getMyRequestStatus
} = require('../controllers/inviteController');
const { protect } = require('../middleware/auth');
const { isGroupMember, isGroupAdmin } = require('../middleware/groupAuth');

// Group routes
router.post('/', protect, createGroup);
router.get('/', protect, getUserGroups);
router.get('/:id', protect, isGroupMember, getGroupDetails);
router.put('/:id', protect, isGroupAdmin, updateGroup);
router.delete('/:id', protect, isGroupAdmin, deleteGroup);

// Member management
router.get('/:id/members', protect, isGroupMember, getGroupMembers);
router.delete('/:id/members/:userId', protect, isGroupAdmin, removeMember);
router.post('/:id/leave', protect, isGroupMember, leaveGroup);

// Invite management
router.post('/:id/regenerate-invite', protect, isGroupAdmin, regenerateInviteCode);

// Join request management (admin)
router.get('/:id/requests', protect, isGroupAdmin, getPendingRequests);
router.post('/:id/requests/:requestId/approve', protect, isGroupAdmin, approveJoinRequest);
router.post('/:id/requests/:requestId/reject', protect, isGroupAdmin, rejectJoinRequest);

// Check own request status
router.get('/:id/my-request', protect, getMyRequestStatus);

module.exports = router;
