const db = require('../config/database');

class Expense {
    // Create new expense
    static async create({ groupId, paidBy, amount, description, category, date, inputMethod, voiceTranscript, receiptUrl, receiptFilename }) {
        try {
            const [result] = await db.execute(
                `INSERT INTO expenses 
        (group_id, paid_by, amount, description, category, expense_date, input_method, voice_transcript, receipt_url, receipt_filename) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [groupId, paidBy, amount, description, category, date, inputMethod || 'manual', voiceTranscript || null, receiptUrl || null, receiptFilename || null]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Find expense by ID
    static async findById(expenseId) {
        try {
            const [rows] = await db.execute(
                `SELECT e.*, u.name as paid_by_name, u.email as paid_by_email,
         g.name as group_name
         FROM expenses e
         JOIN users u ON e.paid_by = u.id
         JOIN \`groups\` g ON e.group_id = g.id
         WHERE e.id = ?`,
                [expenseId]
            );

            if (rows.length === 0) return null;

            // Get splits for this expense
            const splits = await this.getSplits(expenseId);

            return {
                ...rows[0],
                splits
            };
        } catch (error) {
            throw error;
        }
    }

    // Get all expenses for a group
    static async getGroupExpenses(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT e.*, u.name as paid_by_name, u.email as paid_by_email
         FROM expenses e
         JOIN users u ON e.paid_by = u.id
         WHERE e.group_id = ?
         ORDER BY e.expense_date DESC, e.created_at DESC`,
                [groupId]
            );

            // Add full backend URL to receipt_url
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            return rows.map(row => ({
                ...row,
                receipt_url: row.receipt_url ? `${backendUrl}${row.receipt_url}` : null
            }));
        } catch (error) {
            throw error;
        }
    }

    // Update expense
    static async update(expenseId, { amount, description, category, date, receiptUrl, receiptFilename }) {
        try {
            const updates = [];
            const values = [];

            if (amount !== undefined) {
                updates.push('amount = ?');
                values.push(amount);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }
            if (category !== undefined) {
                updates.push('category = ?');
                values.push(category);
            }
            if (date !== undefined) {
                updates.push('expense_date = ?');
                values.push(date);
            }
            if (receiptUrl !== undefined) {
                updates.push('receipt_url = ?');
                values.push(receiptUrl);
            }
            if (receiptFilename !== undefined) {
                updates.push('receipt_filename = ?');
                values.push(receiptFilename);
            }

            if (updates.length === 0) {
                return this.findById(expenseId);
            }

            values.push(expenseId);

            await db.execute(
                `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return this.findById(expenseId);
        } catch (error) {
            throw error;
        }
    }

    // Delete expense
    static async delete(expenseId) {
        try {
            await db.execute('DELETE FROM expenses WHERE id = ?', [expenseId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Add or update expense split
    static async addSplit(expenseId, userId, amount) {
        try {
            await db.execute(
                `INSERT INTO expense_splits (expense_id, user_id, amount) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE amount = ?`,
                [expenseId, userId, amount, amount]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get splits for an expense
    static async getSplits(expenseId) {
        try {
            const [rows] = await db.execute(
                `SELECT es.*, u.name as user_name, u.email as user_email
         FROM expense_splits es
         JOIN users u ON es.user_id = u.id
         WHERE es.expense_id = ?`,
                [expenseId]
            );

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Delete all splits for an expense
    static async deleteSplits(expenseId) {
        try {
            await db.execute('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Check if user is authorized (paid by user or is group member)
    static async checkAuthorization(expenseId, userId) {
        try {
            const [rows] = await db.execute(
                `SELECT e.*, gm.user_id as is_member
         FROM expenses e
         LEFT JOIN group_members gm ON e.group_id = gm.group_id AND gm.user_id = ?
         WHERE e.id = ?`,
                [userId, expenseId]
            );

            if (rows.length === 0) return null;

            return {
                expense: rows[0],
                isAuthorized: rows[0].paid_by === userId || rows[0].is_member !== null
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Expense;
