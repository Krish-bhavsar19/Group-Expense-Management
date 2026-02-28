const db = require('../config/database');

class Subgroup {
    // Create new subgroup
    static async create({ groupId, name, description, createdBy }) {
        try {
            const [result] = await db.execute(
                'INSERT INTO subgroups (group_id, name, description, created_by) VALUES (?, ?, ?, ?)',
                [groupId, name, description, createdBy]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Find subgroup by ID
    static async findById(subgroupId) {
        try {
            const [rows] = await db.execute(
                `SELECT sg.*, u.name as creator_name
                 FROM subgroups sg
                 JOIN users u ON sg.created_by = u.id
                 WHERE sg.id = ?`,
                [subgroupId]
            );

            if (rows.length === 0) return null;

            const subgroup = rows[0];
            subgroup.members = await this.getMembers(subgroupId);
            return subgroup;
        } catch (error) {
            throw error;
        }
    }

    // Get subgroups for a group that the user is a member of
    static async getByGroupId(groupId, userId) {
        try {
            const [rows] = await db.execute(
                `SELECT sg.*, 
                 (SELECT COUNT(*) FROM subgroup_members WHERE subgroup_id = sg.id) as member_count
                 FROM subgroups sg
                 JOIN subgroup_members sm ON sg.id = sm.subgroup_id
                 WHERE sg.group_id = ? AND sm.user_id = ?
                 ORDER BY sg.created_at DESC`,
                [groupId, userId]
            );

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Add member to subgroup
    static async addMember(subgroupId, userId) {
        try {
            await db.execute(
                'INSERT IGNORE INTO subgroup_members (subgroup_id, user_id) VALUES (?, ?)',
                [subgroupId, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get members of a subgroup
    static async getMembers(subgroupId) {
        try {
            const [rows] = await db.execute(
                `SELECT u.id, u.name, u.email
                 FROM subgroup_members sm
                 JOIN users u ON sm.user_id = u.id
                 WHERE sm.subgroup_id = ?`,
                [subgroupId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Remove member from subgroup
    static async removeMember(subgroupId, userId) {
        try {
            await db.execute(
                'DELETE FROM subgroup_members WHERE subgroup_id = ? AND user_id = ?',
                [subgroupId, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Delete subgroup
    static async delete(subgroupId) {
        try {
            await db.execute('DELETE FROM subgroups WHERE id = ?', [subgroupId]);
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Subgroup;
