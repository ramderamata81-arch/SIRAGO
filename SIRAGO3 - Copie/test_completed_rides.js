const db = require('../SiraGO-Backend/config/db');

async function testQuery() {
    try {
        const [rows] = await db.query(`
            SELECT 
                r.id, 
                r.risk_score as ride_risk_score, 
                (SELECT MAX(CASE WHEN a.risk_score > 0 THEN a.risk_score WHEN a.severity = 'CRITICAL' THEN 95 WHEN a.severity = 'HIGH' THEN 75 WHEN a.severity = 'MEDIUM' THEN 50 ELSE 20 END) FROM alerts a WHERE a.ride_id = r.id) as max_alert_risk,
                (SELECT COUNT(*) FROM alerts a WHERE a.ride_id = r.id) as alert_count
            FROM rides r 
            WHERE r.status IN ('COMPLETED', 'CANCELLED')
            ORDER BY r.id DESC
            LIMIT 100
        `);
        const withAlerts = rows.filter(r => r.alert_count > 0);
        console.log("SUCCESS WITH ALERTS:", withAlerts.slice(0, 5));
    } catch (e) {
        console.error("ERROR:", e.message);
    } finally {
        process.exit(0);
    }
}
testQuery();
