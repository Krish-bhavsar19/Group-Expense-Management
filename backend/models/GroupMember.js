const db = require('../config/database');

class GroupMember {
    // Add member to group
    static async addMember(groupId, userId, role = 'member') {
        try {
            await db.execute(
                'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
                [groupId, userId, role]
            );
            return true;
        } catch (error) {
            // Handle duplicate entry
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('User is already a member of this group');
            }
            throw error;
        }
    }

    // Get all members of a group
    static async getGroupMembers(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT gm.*, u.name, u.email, u.created_at as user_since
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = ?
         ORDER BY gm.role DESC, gm.joined_at ASC`,
                [groupId]
            );

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get member role
    static async getMemberRole(groupId, userId) {
        try {
            const [rows] = await db.execute(
                'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId]
            );

            return rows.length > 0 ? rows[0].role : null;
        } catch (error) {
            throw error;
        }
    }

    // Check if user is member
    static async isUserMember(groupId, userId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId]
            );

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Check if user is admin
    static async isUserAdmin(groupId, userId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = "admin"',
                [groupId, userId]
            );

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }

    // Remove member from group
    static async removeMember(groupId, userId) {
        try {
            await db.execute(
                'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get member count
    static async getMemberCount(groupId) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
                [groupId]
            );

            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = GroupMember;
