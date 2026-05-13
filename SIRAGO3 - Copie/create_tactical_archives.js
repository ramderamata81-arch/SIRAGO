const db = require('../SiraGO-Backend/config/db');

async function createTable() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS tactical_archives (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT,
                order_num INT,
                target_type VARCHAR(50),
                video_path VARCHAR(255),
                file_size_bytes INT,
                duration_seconds INT,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(sql);
        console.log('Table tactical_archives created successfully.');
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        process.exit(0);
    }
}
createTable();
