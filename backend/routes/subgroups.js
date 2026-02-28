const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createSubgroup,
    getGroupSubgroups,
    getSubgroup,
    deleteSubgroup
} = require('../controllers/subgroupController');

// All routes are protected
router.use(protect);

// Create subgroup
router.post('/create', createSubgroup);

// Get all subgroups for a group
router.get('/group/:groupId', getGroupSubgroups);

// Get single subgroup
router.get('/:id', getSubgroup);

// Delete subgroup
router.delete('/:id', deleteSubgroup);

module.exports = router;
