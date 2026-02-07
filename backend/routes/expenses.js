const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isGroupMember } = require('../middleware/groupAuth');
const upload = require('../config/multer');
const {
    createExpense,
    parseVoiceInput,
    getGroupExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    updateSplits
} = require('../controllers/expenseController');

// Create expense with optional receipt upload
router.post('/', protect, upload.single('receipt'), createExpense);

// Parse voice input
router.post('/parse-voice', protect, parseVoiceInput);

// Get group expenses (requires group membership)
router.get('/group/:groupId', protect, isGroupMember, getGroupExpenses);

// Single expense operations
router.get('/:id', protect, getExpense);
router.put('/:id', protect, upload.single('receipt'), updateExpense);
router.delete('/:id', protect, deleteExpense);

// Expense splits
router.post('/:id/splits', protect, updateSplits);

module.exports = router;
