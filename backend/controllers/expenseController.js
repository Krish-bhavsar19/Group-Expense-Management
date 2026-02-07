const Expense = require('../models/Expense');
const AIService = require('../services/aiService');
const fs = require('fs');
const path = require('path');

// Create expense
const createExpense = async (req, res) => {
    try {
        const { groupId, amount, description, category, date, inputMethod, voiceTranscript, splits } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!groupId || !amount || !description) {
            return res.status(400).json({
                success: false,
                message: 'Group ID, amount, and description are required'
            });
        }

        // Check if user is a member of the group
        const GroupMember = require('../models/GroupMember');
        const isMember = await GroupMember.isUserMember(groupId, userId);

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        // Handle receipt upload
        const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;
        const receiptFilename = req.file ? req.file.filename : null;

        // Create expense
        const expense = await Expense.create({
            groupId,
            paidBy: userId,
            amount: parseFloat(amount),
            description,
            category: category || 'other',
            date: date || new Date().toISOString().split('T')[0],
            inputMethod: inputMethod || 'manual',
            voiceTranscript: voiceTranscript || null,
            receiptUrl,
            receiptFilename
        });

        // Add splits if provided
        if (splits) {
            const splitsArray = typeof splits === 'string' ? JSON.parse(splits) : splits;
            for (const split of splitsArray) {
                await Expense.addSplit(expense.id, split.userId, parseFloat(split.amount));
            }
        }

        // Fetch expense with splits
        const completeExpense = await Expense.findById(expense.id);

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            data: completeExpense
        });
    } catch (error) {
        console.error('Create expense error:', error);

        // Delete uploaded file if expense creation failed
        if (req.file) {
            const filePath = path.join(__dirname, '..', 'uploads', 'receipts', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        });
    }
};

// Parse voice input
const parseVoiceInput = async (req, res) => {
    try {
        const { transcript } = req.body;

        if (!transcript) {
            return res.status(400).json({
                success: false,
                message: 'Transcript is required'
            });
        }

        const parsed = await AIService.parseVoiceExpense(transcript);

        res.json({
            success: true,
            parsed
        });
    } catch (error) {
        console.error('Voice parsing error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to parse voice input'
        });
    }
};

// Get group expenses
const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        console.log('🔍 getGroupExpenses called for groupId:', groupId);

        const expenses = await Expense.getGroupExpenses(groupId);
        console.log('📊 Found expenses:', expenses.length);

        res.json({
            success: true,
            data: expenses
        });
    } catch (error) {
        console.error('Get group expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve expenses',
            error: error.message
        });
    }
};

// Get single expense
const getExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const authCheck = await Expense.checkAuthorization(id, userId);

        if (!authCheck) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (!authCheck.isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this expense'
            });
        }

        const expense = await Expense.findById(id);

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve expense',
            error: error.message
        });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, category, date } = req.body;
        const userId = req.user.id;

        // Check authorization
        const authCheck = await Expense.checkAuthorization(id, userId);

        if (!authCheck || !authCheck.isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this expense'
            });
        }

        // Handle receipt upload
        const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;
        const receiptFilename = req.file ? req.file.filename : undefined;

        // If new receipt uploaded, delete old one
        if (req.file && authCheck.expense.receipt_filename) {
            const oldPath = path.join(__dirname, '..', 'uploads', 'receipts', authCheck.expense.receipt_filename);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const expense = await Expense.update(id, {
            amount: amount ? parseFloat(amount) : undefined,
            description,
            category,
            date,
            receiptUrl,
            receiptFilename
        });

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update expense',
            error: error.message
        });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check authorization
        const authCheck = await Expense.checkAuthorization(id, userId);

        if (!authCheck || !authCheck.isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this expense'
            });
        }

        // Delete receipt file if exists
        if (authCheck.expense.receipt_filename) {
            const filePath = path.join(__dirname, '..', 'uploads', 'receipts', authCheck.expense.receipt_filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Expense.delete(id);

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete expense',
            error: error.message
        });
    }
};

// Update expense splits
const updateSplits = async (req, res) => {
    try {
        const { id } = req.params;
        const { splits } = req.body;
        const userId = req.user.id;

        // Check authorization
        const authCheck = await Expense.checkAuthorization(id, userId);

        if (!authCheck || !authCheck.isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update splits'
            });
        }

        if (!splits || !Array.isArray(splits)) {
            return res.status(400).json({
                success: false,
                message: 'Splits array is required'
            });
        }

        // Delete existing splits
        await Expense.deleteSplits(id);

        // Add new splits
        for (const split of splits) {
            await Expense.addSplit(id, split.userId, parseFloat(split.amount));
        }

        const expense = await Expense.findById(id);

        res.json({
            success: true,
            message: 'Splits updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Update splits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update splits',
            error: error.message
        });
    }
};

module.exports = {
    createExpense,
    parseVoiceInput,
    getGroupExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    updateSplits
};
