-- Group Expense Management Database Schema
-- MySQL 8.0+

-- Drop existing database if needed (uncomment for fresh start)
-- DROP DATABASE IF EXISTS group_expense_management;

-- Create database
CREATE DATABASE IF NOT EXISTS group_expense_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE group_expense_management;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Can be NULL for Google OAuth users
    auth_metadata JSON DEFAULT (JSON_OBJECT()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- auth_metadata JSON structure:
-- {
--   "otp": "123456",
--   "otpExpiry": "2026-02-06T22:00:00Z",
--   "isEmailVerified": false,
--   "googleId": null,
--   "loginAttempts": 0,
--   "lastLoginAttempt": null
-- }

-- Future tables (to be implemented in later phases)

-- Groups Table (Phase 2)
-- CREATE TABLE groups (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(255) NOT NULL,
--     description TEXT,
--     created_by INT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_created_by (created_by)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Group Members Table (Phase 2)
-- CREATE TABLE group_members (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     group_id INT NOT NULL,
--     user_id INT NOT NULL,
--     role ENUM('admin', 'member') DEFAULT 'member',
--     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     UNIQUE KEY unique_group_member (group_id, user_id),
--     INDEX idx_group_id (group_id),
--     INDEX idx_user_id (user_id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses Table (Phase 3)
-- CREATE TABLE expenses (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     group_id INT NOT NULL,
--     subgroup_id INT,
--     paid_by INT NOT NULL,
--     amount DECIMAL(10, 2) NOT NULL,
--     description VARCHAR(500) NOT NULL,
--     category VARCHAR(100),
--     expense_date DATE NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
--     FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_group_id (group_id),
--     INDEX idx_paid_by (paid_by),
--     INDEX idx_expense_date (expense_date)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subgroups Table (Phase 4)
-- CREATE TABLE subgroups (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     parent_group_id INT NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     created_by INT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (parent_group_id) REFERENCES groups(id) ON DELETE CASCADE,
--     FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_parent_group (parent_group_id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages Table (Phase 5)
-- CREATE TABLE messages (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     group_id INT NOT NULL,
--     user_id INT NOT NULL,
--     message TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--     INDEX idx_group_id_created (group_id, created_at)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
