-- Create subgroups table
CREATE TABLE IF NOT EXISTS `subgroups` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `group_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create subgroup_members table
CREATE TABLE IF NOT EXISTS `subgroup_members` (
    `subgroup_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`subgroup_id`, `user_id`),
    FOREIGN KEY (`subgroup_id`) REFERENCES `subgroups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Add subgroup_id to expenses table
ALTER TABLE `expenses`
ADD COLUMN `subgroup_id` INT DEFAULT NULL,
ADD FOREIGN KEY (`subgroup_id`) REFERENCES `subgroups`(`id`) ON DELETE SET NULL;
