const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isGroupMember } = require('../middleware/groupAuth');
const { getGroupSettlement } = require('../controllers/settlementController');

// Get group settlement/balances
router.get('/group/:groupId', protect, isGroupMember, getGroupSettlement);

module.exports = router;
