const express = require('express');
const router = express.Router();
const {
    getGroupByInviteCode,
    sendJoinRequest
} = require('../controllers/inviteController');
const { protect } = require('../middleware/auth');

// Public route - get group info by invite code
router.get('/:inviteCode', getGroupByInviteCode);

// Protected route - send join request
router.post('/:inviteCode/request', protect, sendJoinRequest);

module.exports = router;
