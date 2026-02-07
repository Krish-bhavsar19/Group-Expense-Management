const db = require('../config/database');
const crypto = require('crypto');

class Group {
    // Generate secure random invite code
    static generateInviteCode() {
        return crypto.randomBytes(32).toString('hex'); // 64 characters
    }

    // Create new group
    static async create({ name, description, createdBy }) {
        try {
            const inviteCode = this.generateInviteCode();

            const [result] = await db.execute(
                'INSERT INTO `groups` (name, description, invite_code, created_by) VALUES (?, ?, ?, ?)',
                [name, description, inviteCode, createdBy]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Find group by ID
    static async findById(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT g.*, u.name as creator_name, u.email as creator_email,
         (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM \`groups\` g
         JOIN users u ON g.created_by = u.id
         WHERE g.id = ?`,
                [groupId]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Find group by invite code
    static async findByInviteCode(inviteCode) {
        try {
            const [rows] = await db.execute(
                `SELECT g.*, u.name as creator_name,
         (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM \`groups\` g
         JOIN users u ON g.created_by = u.id
         WHERE g.invite_code = ?`,
                [inviteCode]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Get all groups for a user
    static async getUserGroups(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT g.*, gm.role,
         (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM \`groups\` g
         JOIN group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = ?
         ORDER BY g.created_at DESC`,
                [userId]
            );

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Update group
    static async update(groupId, { name, description }) {
        try {
            await db.execute(
                'UPDATE `groups` SET name = ?, description = ? WHERE id = ?',
                [name, description, groupId]
            );

            return this.findById(groupId);
        } catch (error) {
            throw error;
        }
    }

    // Delete group
    static async delete(groupId) {
        try {
            await db.execute('DELETE FROM `groups` WHERE id = ?', [groupId]);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Regenerate invite code
    static async regenerateInviteCode(groupId) {
        try {
            const newInviteCode = this.generateInviteCode();
            await db.execute(
                'UPDATE `groups` SET invite_code = ? WHERE id = ?',
                [newInviteCode, groupId]
            );

            return this.findById(groupId);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Group;
