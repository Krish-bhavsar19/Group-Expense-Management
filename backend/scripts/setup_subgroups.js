require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupSubgroups() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'group_expense_management'
        });

        console.log('✅ Connected.');

        // 1. Create subgroups table
        console.log('Creating subgroups table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS subgroups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ subgroups table ready.');

        // 2. Create subgroup_members table
        console.log('Creating subgroup_members table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS subgroup_members (
                subgroup_id INT NOT NULL,
                user_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (subgroup_id, user_id),
                FOREIGN KEY (subgroup_id) REFERENCES subgroups(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ subgroup_members table ready.');

        // 3. Update expenses table to add subgroup_id
        console.log('Updating expenses table...');
        try {
            // First check if column exists
            const [columns] = await connection.execute("SHOW COLUMNS FROM expenses LIKE 'subgroup_id'");
            if (columns.length === 0) {
                await connection.execute(`
                    ALTER TABLE expenses 
                    ADD COLUMN subgroup_id INT NULL AFTER group_id,
                    ADD FOREIGN KEY (subgroup_id) REFERENCES subgroups(id) ON DELETE SET NULL
                `);
                console.log('✅ expenses table updated with subgroup_id.');
            } else {
                console.log('✅ subgroup_id column already exists in expenses table.');
            }
        } catch (error) {
            console.error('⚠️ Error updating expenses table:', error.message);
            // It might already exist, so we don't necessarily want to fail completely
        }

        await connection.end();
        console.log('🎉 Setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setupSubgroups();
