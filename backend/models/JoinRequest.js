const db = require('../config/database');

class JoinRequest {
    // Create join request
    static async createRequest(groupId, userId) {
        try {
            // Check if user is already a member
            const [memberCheck] = await db.execute(
                'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
                [groupId, userId]
            );

            if (memberCheck.length > 0) {
                throw new Error('You are already a member of this group');
            }

            // Check for existing pending request
            const [existingRequest] = await db.execute(
                'SELECT id FROM join_requests WHERE group_id = ? AND user_id = ? AND status = "pending"',
                [groupId, userId]
            );

            if (existingRequest.length > 0) {
                throw new Error('You already have a pending request for this group');
            }

            const [result] = await db.execute(
                'INSERT INTO join_requests (group_id, user_id) VALUES (?, ?)',
                [groupId, userId]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Find request by ID
    static async findById(requestId) {
        try {
            const [rows] = await db.execute(
                `SELECT jr.*, u.name as user_name, u.email as user_email, g.name as group_name
         FROM join_requests jr
         JOIN users u ON jr.user_id = u.id
         JOIN \`groups\` g ON jr.group_id = g.id
         WHERE jr.id = ?`,
                [requestId]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Get pending requests for a group
    static async getPendingRequests(groupId) {
        try {
            const [rows] = await db.execute(
                `SELECT jr.*, u.name as user_name, u.email as user_email
         FROM join_requests jr
         JOIN users u ON jr.user_id = u.id
         WHERE jr.group_id = ? AND jr.status = "pending"
         ORDER BY jr.requested_at DESC`,
                [groupId]
            );

            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Get user's request for a group
    static async getUserRequest(groupId, userId) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM join_requests 
         WHERE group_id = ? AND user_id = ? AND status = "pending"
         ORDER BY requested_at DESC
         LIMIT 1`,
                [groupId, userId]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Approve request
    static async approveRequest(requestId, reviewedBy) {
        try {
            const request = await this.findById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Request has already been reviewed');
            }

            // Start transaction
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Update request status
                await connection.execute(
                    'UPDATE join_requests SET status = "approved", reviewed_at = NOW(), reviewed_by = ? WHERE id = ?',
                    [reviewedBy, requestId]
                );

                // Add user to group members
                await connection.execute(
                    'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, "member")',
                    [request.group_id, request.user_id]
                );

                await connection.commit();
                connection.release();

                return true;
            } catch (error) {
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    // Reject request
    static async rejectRequest(requestId, reviewedBy) {
        try {
            const request = await this.findById(requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Request has already been reviewed');
            }

            await db.execute(
                'UPDATE join_requests SET status = "rejected", reviewed_at = NOW(), reviewed_by = ? WHERE id = ?',
                [reviewedBy, requestId]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Check if user has existing request
    static async hasExistingRequest(groupId, userId) {
        try {
            const [rows] = await db.execute(
                'SELECT id FROM join_requests WHERE group_id = ? AND user_id = ? AND status = "pending"',
                [groupId, userId]
            );

            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = JoinRequest;
