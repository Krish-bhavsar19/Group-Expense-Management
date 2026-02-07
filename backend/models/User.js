const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create({ name, email, password, auth_metadata = {} }) {
        try {
            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }

            // Default auth_metadata structure
            const defaultMetadata = {
                isEmailVerified: false,
                googleId: null,
                otp: null,
                otpExpiry: null,
                loginAttempts: 0,
                lastLoginAttempt: null,
                ...auth_metadata
            };

            const [result] = await db.execute(
                'INSERT INTO users (name, email, password, auth_metadata) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, JSON.stringify(defaultMetadata)]
            );

            return this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT id, name, email, password, auth_metadata, created_at, updated_at FROM users WHERE id = ?',
                [id]
            );

            if (rows.length === 0) return null;

            const user = rows[0];
            // Parse JSON auth_metadata
            user.auth_metadata = typeof user.auth_metadata === 'string'
                ? JSON.parse(user.auth_metadata)
                : user.auth_metadata;

            return user;
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT id, name, email, password, auth_metadata, created_at, updated_at FROM users WHERE email = ?',
                [email]
            );

            if (rows.length === 0) return null;

            const user = rows[0];
            // Parse JSON auth_metadata
            user.auth_metadata = typeof user.auth_metadata === 'string'
                ? JSON.parse(user.auth_metadata)
                : user.auth_metadata;

            return user;
        } catch (error) {
            throw error;
        }
    }

    // Update auth metadata
    static async updateAuthMetadata(userId, metadata) {
        try {
            await db.execute(
                'UPDATE users SET auth_metadata = ? WHERE id = ?',
                [JSON.stringify(metadata), userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Update Google OAuth info
    static async updateGoogleAuth(userId, googleId) {
        try {
            const user = await this.findById(userId);
            if (!user) return false;

            const metadata = {
                ...user.auth_metadata,
                googleId,
                isEmailVerified: true
            };

            await this.updateAuthMetadata(userId, metadata);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Update password
    static async updatePassword(userId, newPassword) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            await db.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw error;
        }
    }

    // Get user without sensitive data
    static getSafeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }
}

module.exports = User;
