const mysql = require('mysql2/promise');
require('dotenv').config();

// Création du pool de connexions à la base de données
// Utilisation d'un pool pour gérer efficacement plusieurs connexions simultanées
const poolConnexion = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sirago_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// État de la connexion exporté pour les autres services
let isMySQLConnected = false;
let hasMigrationRun = false; 
let hasBootRun = false; // ✅ [FIX] Empêche le nettoyage BOOT de répéter à chaque heartbeat

// Vérification de la connexion au démarrage + Migration automatique
async function verifierConnexion() {
  try {
    const connexion = await poolConnexion.getConnection();
    const [rows] = await connexion.query('SELECT DATABASE() as db');
    console.log(`✅ Connecté avec succès à la base de données MySQL : ${rows[0].db}`);
    isMySQLConnected = true;
    
    // ✅ [BOOT/RESTORE] Ces nettoyages ne s'exécutent QU'UNE SEULE FOIS au démarrage
    if (!hasBootRun) {
      hasBootRun = true;

      // Reset ghost drivers
      await connexion.query(`
        UPDATE drivers 
        SET is_online = 0 
        WHERE last_location_update < DATE_SUB(NOW(), INTERVAL 30 MINUTE)
          AND is_online = 1
      `);
      console.log('🧹 [BOOT] Chauffeurs fantômes déconnectés automatiquement');

      // Cleanup corrupted ride statuses
      await connexion.query(`
        UPDATE rides SET status = 'DRIVER_ACCEPTED' 
        WHERE status IN ('DRIVERR_ACCEPTED', 'DRIVER__ACCEPTED', 'DRIVER_AACCEPTED') 
        AND completed_at IS NULL
      `);
      await connexion.query(`
        UPDATE rides SET status = 'DRIVER_ARRIVING' 
        WHERE status IN ('DRIVERR_ARRIVING', 'GOING__TO_PICKUP', 'DRIVER_AARRIVING') 
        AND completed_at IS NULL
      `);
      await connexion.query(`
        UPDATE rides SET status = 'REQUESTED' 
        WHERE status IN ('SEARCHIING', 'SEARCHHING', 'SEARCHINNG', 'REQUESTEDD') 
        AND completed_at IS NULL
      `);
      
      // Annuler les courses fantômes bloquées
      try {
        const [cleanup] = await connexion.query(`
          UPDATE rides 
          SET status = 'CANCELLED', cancellation_reason = 'AUTO_CLEANUP_STALE'
          WHERE status IN ('ACCEPTED', 'PICKUP', 'EN_ROUTE', 'STARTED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVING', 'PASSENGER_ONBOARD', 'ARRIVED')
          AND (created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE) OR created_at IS NULL)
          AND (completed_at IS NULL)
        `);
        if (cleanup.affectedRows > 0) {
            console.log(`🧹 [BOOT] ${cleanup.affectedRows} courses bloquées ont été annulées automatiquement.`);
        }
      } catch (e) {
        console.warn('⚠️ [BOOT] Erreur lors du nettoyage des courses:', e.message);
      }
      
      console.log('🧹 [BOOT] Statuts de courses corrompus réparés');
    }

    // 🛠️ Migration: Ajouter les colonnes critiques si absentes
    try {
      const tablesToCheck = ['users', 'drivers', 'rides', 'pois', 'pricing_settings', 'driver_positions', 'ride_candidates', 'user_blacklist', 'sms_resilience_logs', 'alerts', 'admin_audit_logs', 'user_reputation', 'ride_status_history', 'password_reset_requests', 'ride_cancellations', 'driver_wallets', 'wallet_transactions', 'ride_tracking', 'ride_events_log', 'security_alerts', 'missing_pois'];
      for (const table of tablesToCheck) {
        // Pour MySQL, on vérifie si la table existe avant de lister les colonnes
        const [tables] = await connexion.query(`SHOW TABLES LIKE '${table}'`);
        
        if (tables.length === 0 && (table === 'driver_positions' || table === 'ride_candidates' || table === 'driver_wallets' || table === 'wallet_transactions' || table === 'ride_tracking' || table === 'ride_events_log' || table === 'security_alerts')) {
          console.log(`📦 [DB_MIGRATION] Création de la table '${table}'...`);
          if (table === 'driver_positions') {
            await connexion.query(`
              CREATE TABLE driver_positions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id VARCHAR(50),
                driver_id INT,
                latitude DOUBLE,
                longitude DOUBLE,
                heading FLOAT,
                speed FLOAT,
                timestamp BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (ride_id),
                INDEX (driver_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'ride_candidates') {
            await connexion.query(`
              CREATE TABLE ride_candidates (
                ride_id INT,
                driver_id INT,
                status VARCHAR(30) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (ride_id, driver_id),
                INDEX (ride_id),
                INDEX (driver_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'user_blacklist') {
            await connexion.query(`
              CREATE TABLE user_blacklist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                blocked_user_id INT,
                reason TEXT,
                ride_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (user_id),
                INDEX (blocked_user_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'sms_resilience_logs') {
            await connexion.query(`
              CREATE TABLE sms_resilience_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone_number VARCHAR(20),
                user_id INT,
                ride_id INT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(10,8),
                heading FLOAT,
                speed FLOAT,
                raw_message TEXT,
                received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (phone_number),
                INDEX (user_id),
                INDEX (ride_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'password_reset_requests') {
            await connexion.query(`
              CREATE TABLE password_reset_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'PENDING',
                admin_id INT DEFAULT NULL,
                temp_password VARCHAR(255) DEFAULT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (user_id),
                INDEX (status)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'alerts') {
            await connexion.query(`
              CREATE TABLE alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ride_id INT,
                type VARCHAR(50),
                severity VARCHAR(20) DEFAULT 'MEDIUM',
                status VARCHAR(20) DEFAULT 'OPEN',
                message TEXT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(10,8),
                is_listening_active TINYINT(1) DEFAULT 0,
                triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (user_id),
                INDEX (ride_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'admin_audit_logs') {
            await connexion.query(`
              CREATE TABLE admin_audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                admin_id INT,
                admin_name VARCHAR(255),
                action_type VARCHAR(100),
                target_id VARCHAR(100),
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (admin_id),
                INDEX (action_type)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'user_reputation') {
            await connexion.query(`
              CREATE TABLE user_reputation (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                cancel_count INT DEFAULT 0,
                strike_count INT DEFAULT 0,
                is_blocked TINYINT(1) DEFAULT 0,
                last_cancel_reason TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (user_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'ride_status_history') {
            await connexion.query(`
              CREATE TABLE ride_status_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT,
                old_status VARCHAR(50),
                new_status VARCHAR(50),
                details JSON DEFAULT NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (ride_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'ride_cancellations') {
            await connexion.query(`
              CREATE TABLE ride_cancellations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT,
                user_id INT,
                cancelled_by VARCHAR(50),
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (ride_id),
                INDEX (user_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'driver_wallets') {
            await connexion.query(`
              CREATE TABLE driver_wallets (
                driver_id INT PRIMARY KEY,
                balance DECIMAL(10,2) DEFAULT 0.00,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX (driver_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'wallet_transactions') {
            await connexion.query(`
              CREATE TABLE wallet_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                driver_id INT NOT NULL,
                ride_id INT DEFAULT NULL,
                type ENUM('DEPOSIT', 'WITHDRAWAL', 'COMMISSION', 'REFUND', 'RECHARGE') NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                balance_before DECIMAL(10,2) DEFAULT 0,
                balance_after DECIMAL(10,2) DEFAULT 0,
                status ENUM('PENDING', 'VALIDATED', 'REJECTED', 'COMPLETED') DEFAULT 'COMPLETED',
                payment_method VARCHAR(50) DEFAULT 'CASH',
                reference VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (driver_id),
                INDEX (ride_id),
                INDEX (status)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'ride_tracking') {
            await connexion.query(`
              CREATE TABLE ride_tracking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT,
                driver_id INT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                source VARCHAR(50) DEFAULT 'APP_DATA',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (ride_id),
                INDEX (driver_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'ride_events_log') {
            await connexion.query(`
              CREATE TABLE ride_events_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                message TEXT,
                details JSON,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ride (ride_id),
                INDEX idx_type (event_type)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'security_alerts') {
            await connexion.query(`
              CREATE TABLE security_alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ride_id INT NOT NULL,
                user_id INT NOT NULL,
                alert_type ENUM('CODE_ROUGE','CODE_VERT','TIMEOUT','DEVIATION') DEFAULT 'CODE_ROUGE',
                lat DECIMAL(10,7),
                lng DECIMAL(10,7),
                resolved TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ride (ride_id),
                INDEX idx_created (created_at)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          } else if (table === 'missing_pois') {
            await connexion.query(`
              CREATE TABLE missing_pois (
                id INT AUTO_INCREMENT PRIMARY KEY,
                query VARCHAR(255) NOT NULL,
                user_id INT,
                latitude DECIMAL(10,8),
                longitude DECIMAL(11,8),
                status VARCHAR(20) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (query),
                INDEX (status)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
          }
          continue;
        }

        if (tables.length === 0) continue;

        const [columns] = await connexion.query(`SHOW COLUMNS FROM ${table}`);
        const columnNames = columns.map(c => c.Field);

        if (table === 'users') {
          // ✅ [DB_FIX] Renommer les colonnes si elles existent sous l'ancien nom
          if (columnNames.includes('phone') && !columnNames.includes('phone_number')) {
            console.log('🔄 [DB_MIGRATION] users.phone -> phone_number');
            await connexion.query('ALTER TABLE users CHANGE COLUMN phone phone_number VARCHAR(20) NOT NULL');
          }
          if (columnNames.includes('password') && !columnNames.includes('password_hash')) {
            console.log('🔄 [DB_MIGRATION] users.password -> password_hash');
            await connexion.query('ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL');
          }

          // ✅ [DB_CLEANUP] Supprimer la colonne 'name' obsolète (conflit avec full_name)
          // On tente l'opération sans condition car le cache columnNames peut être obsolète lors d'un crash
          try {
             await connexion.query('ALTER TABLE users MODIFY COLUMN name VARCHAR(255) DEFAULT NULL');
             console.log('✅ [DB_MIGRATION] users.name rendu nullable (Force)');
          } catch (e) {
             // Colonne probablement déjà supprimée ou absente
          }

          if (!columnNames.includes('role')) await connexion.query("ALTER TABLE users ADD COLUMN role ENUM('PASSENGER','DRIVER','ADMIN','BOTH') NOT NULL DEFAULT 'PASSENGER'");
          if (!columnNames.includes('status')) await connexion.query("ALTER TABLE users ADD COLUMN status VARCHAR(30) DEFAULT 'active'");
          if (!columnNames.includes('passenger_rating')) await connexion.query("ALTER TABLE users ADD COLUMN passenger_rating DECIMAL(3,2) DEFAULT NULL");
          if (!columnNames.includes('has_setup_codes')) await connexion.query('ALTER TABLE users ADD COLUMN has_setup_codes TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('is_active')) await connexion.query('ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1');
          if (!columnNames.includes('sos_real_code_hash')) await connexion.query('ALTER TABLE users ADD COLUMN sos_real_code_hash VARCHAR(255) DEFAULT NULL');
          if (!columnNames.includes('sos_fake_code_hash')) await connexion.query('ALTER TABLE users ADD COLUMN sos_fake_code_hash VARCHAR(255) DEFAULT NULL');
          if (!columnNames.includes('sos_real_code')) await connexion.query("ALTER TABLE users ADD COLUMN sos_real_code VARCHAR(10) DEFAULT '1234'");
          if (!columnNames.includes('sos_fake_code')) await connexion.query("ALTER TABLE users ADD COLUMN sos_fake_code VARCHAR(10) DEFAULT '0000'");
          if (!columnNames.includes('cancellation_count')) await connexion.query('ALTER TABLE users ADD COLUMN cancellation_count INT DEFAULT 0');
          
          // ✅ [SOUTENANCE] Colonnes additionnelles pour la sécurité
          if (!columnNames.includes('contact_urgence')) await connexion.query('ALTER TABLE users ADD COLUMN contact_urgence VARCHAR(20) DEFAULT NULL');
          if (!columnNames.includes('code_securite_vrai')) await connexion.query('ALTER TABLE users ADD COLUMN code_securite_vrai VARCHAR(10) DEFAULT NULL');
          if (!columnNames.includes('code_securite_faux')) await connexion.query('ALTER TABLE users ADD COLUMN code_securite_faux VARCHAR(10) DEFAULT NULL');
        }
        
        if (table === 'drivers') {
          // ✅ [FIX] Colonnes KYC pour l'inscription chauffeur
          if (!columnNames.includes('license_number')) await connexion.query('ALTER TABLE drivers ADD COLUMN license_number VARCHAR(50)');
          if (!columnNames.includes('license_image_url')) await connexion.query('ALTER TABLE drivers ADD COLUMN license_image_url VARCHAR(255)');
          if (!columnNames.includes('id_card_image_url')) await connexion.query('ALTER TABLE drivers ADD COLUMN id_card_image_url VARCHAR(255)');
          if (!columnNames.includes('registration_card_image_url')) await connexion.query('ALTER TABLE drivers ADD COLUMN registration_card_image_url VARCHAR(255)');
          if (!columnNames.includes('criminal_record_image_url')) await connexion.query('ALTER TABLE drivers ADD COLUMN criminal_record_image_url VARCHAR(255)');

          if (!columnNames.includes('license_plate')) await connexion.query('ALTER TABLE drivers ADD COLUMN license_plate VARCHAR(20)');
          if (!columnNames.includes('vehicle_model')) await connexion.query('ALTER TABLE drivers ADD COLUMN vehicle_model VARCHAR(100)');
          if (!columnNames.includes('is_online')) await connexion.query('ALTER TABLE drivers ADD COLUMN is_online TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('current_lat')) await connexion.query('ALTER TABLE drivers ADD COLUMN current_lat DECIMAL(10,8)');
          if (!columnNames.includes('current_lng')) await connexion.query('ALTER TABLE drivers ADD COLUMN current_lng DECIMAL(10,8)');
          // ✅ [FIX] last_ping, last_heartbeat et last_location_update pour le Watchdog
          if (!columnNames.includes('last_ping')) await connexion.query('ALTER TABLE drivers ADD COLUMN last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
          if (!columnNames.includes('last_heartbeat')) await connexion.query('ALTER TABLE drivers ADD COLUMN last_heartbeat TIMESTAMP NULL');
          if (!columnNames.includes('last_location_update')) await connexion.query('ALTER TABLE drivers ADD COLUMN last_location_update TIMESTAMP NULL');
          if (!columnNames.includes('rating')) await connexion.query('ALTER TABLE drivers ADD COLUMN rating DECIMAL(3,2) DEFAULT 5.00');
          if (!columnNames.includes('is_verified')) await connexion.query('ALTER TABLE drivers ADD COLUMN is_verified TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('has_signed_contract')) await connexion.query('ALTER TABLE drivers ADD COLUMN has_signed_contract TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('contract_version')) await connexion.query("ALTER TABLE drivers ADD COLUMN contract_version VARCHAR(10) DEFAULT '1.0'");
          if (!columnNames.includes('is_certified')) await connexion.query('ALTER TABLE drivers ADD COLUMN is_certified TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('heading')) await connexion.query('ALTER TABLE drivers ADD COLUMN heading FLOAT DEFAULT 0');
          if (!columnNames.includes('current_lat')) await connexion.query('ALTER TABLE drivers ADD COLUMN current_lat DECIMAL(10,8)');
          if (!columnNames.includes('current_lng')) await connexion.query('ALTER TABLE drivers ADD COLUMN current_lng DECIMAL(10,8)');
        }

        if (table === 'rides') {
          if (!columnNames.includes('approach_polyline')) await connexion.query('ALTER TABLE rides ADD COLUMN approach_polyline TEXT');
          if (!columnNames.includes('destination_polyline')) await connexion.query('ALTER TABLE rides ADD COLUMN destination_polyline TEXT');
          if (!columnNames.includes('trip_polyline')) await connexion.query('ALTER TABLE rides ADD COLUMN trip_polyline TEXT');
          if (!columnNames.includes('estimated_distance')) await connexion.query('ALTER TABLE rides ADD COLUMN estimated_distance DECIMAL(10,2) DEFAULT 0.00');
          if (!columnNames.includes('distance_km')) await connexion.query('ALTER TABLE rides ADD COLUMN distance_km FLOAT DEFAULT 0');
          if (!columnNames.includes('estimated_duration')) await connexion.query('ALTER TABLE rides ADD COLUMN estimated_duration INT DEFAULT 0');
          if (!columnNames.includes('price_total')) await connexion.query('ALTER TABLE rides ADD COLUMN price_total DECIMAL(10,2) DEFAULT 0');
          if (!columnNames.includes('estimated_price')) await connexion.query('ALTER TABLE rides ADD COLUMN estimated_price DECIMAL(10,2) DEFAULT 0');
          if (!columnNames.includes('base_fare')) await connexion.query('ALTER TABLE rides ADD COLUMN base_fare INT DEFAULT 0');
          if (!columnNames.includes('otp')) {
              await connexion.query('ALTER TABLE rides ADD COLUMN otp VARCHAR(10) DEFAULT NULL');
              console.log("🛠️ [DB] Colonne 'otp' ajoutée.");
          }
          if (!columnNames.includes('active_contact_phone')) {
              await connexion.query('ALTER TABLE rides ADD COLUMN active_contact_phone VARCHAR(20) DEFAULT NULL');
              console.log("🛠️ [DB] Colonne 'active_contact_phone' ajoutée.");
          }
          if (!columnNames.includes('pickup_poi_id')) {
              await connexion.query('ALTER TABLE rides ADD COLUMN pickup_poi_id VARCHAR(50) DEFAULT NULL');
              console.log("🛠️ [DB] Colonne 'pickup_poi_id' ajoutée.");
          }
          if (!columnNames.includes('is_simulated')) await connexion.query('ALTER TABLE rides ADD COLUMN is_simulated TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('historical_path')) await connexion.query('ALTER TABLE rides ADD COLUMN historical_path LONGTEXT');
          if (!columnNames.includes('passenger_gps_lat')) await connexion.query('ALTER TABLE rides ADD COLUMN passenger_gps_lat DECIMAL(10,8)');
          if (!columnNames.includes('passenger_gps_lng')) await connexion.query('ALTER TABLE rides ADD COLUMN passenger_gps_lng DECIMAL(10,8)');
          if (!columnNames.includes('offline_sync_status')) await connexion.query("ALTER TABLE rides ADD COLUMN offline_sync_status VARCHAR(20) DEFAULT 'PENDING'");
          if (!columnNames.includes('last_offline_sync')) await connexion.query('ALTER TABLE rides ADD COLUMN last_offline_sync TIMESTAMP NULL');
          if (!columnNames.includes('rating_passenger')) await connexion.query('ALTER TABLE rides ADD COLUMN rating_passenger INT DEFAULT NULL');
          if (!columnNames.includes('rating_driver')) await connexion.query('ALTER TABLE rides ADD COLUMN rating_driver INT DEFAULT NULL');
          if (!columnNames.includes('comment_passenger')) await connexion.query('ALTER TABLE rides ADD COLUMN comment_passenger TEXT DEFAULT NULL');
          if (!columnNames.includes('comment_driver')) await connexion.query('ALTER TABLE rides ADD COLUMN comment_driver TEXT DEFAULT NULL');
          if (!columnNames.includes('rated_at')) await connexion.query('ALTER TABLE rides ADD COLUMN rated_at TIMESTAMP NULL');
          if (!columnNames.includes('pickup_confirmed')) await connexion.query('ALTER TABLE rides ADD COLUMN pickup_confirmed TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('pickup_confirmed_at')) await connexion.query('ALTER TABLE rides ADD COLUMN pickup_confirmed_at TIMESTAMP NULL');
          if (!columnNames.includes('smart_pickup_confirmed')) await connexion.query('ALTER TABLE rides ADD COLUMN smart_pickup_confirmed TINYINT(1) DEFAULT 0');
          if (!columnNames.includes('cancellation_reason')) await connexion.query('ALTER TABLE rides ADD COLUMN cancellation_reason TEXT DEFAULT NULL');
          if (!columnNames.includes('cancelled_by')) await connexion.query('ALTER TABLE rides ADD COLUMN cancelled_by VARCHAR(50) DEFAULT NULL');
          if (!columnNames.includes('start_time')) await connexion.query('ALTER TABLE rides ADD COLUMN start_time DATETIME DEFAULT NULL');
          if (!columnNames.includes('completed_at')) await connexion.query('ALTER TABLE rides ADD COLUMN completed_at DATETIME DEFAULT NULL');
          if (!columnNames.includes('current_lat')) await connexion.query('ALTER TABLE rides ADD COLUMN current_lat DECIMAL(10,8)');
          if (!columnNames.includes('current_lng')) await connexion.query('ALTER TABLE rides ADD COLUMN current_lng DECIMAL(10,8)');
          if (!columnNames.includes('heading')) await connexion.query('ALTER TABLE rides ADD COLUMN heading FLOAT DEFAULT 0');
          
          // ✅ [FIX] updated_at manquant pour les nettoyages
          if (!columnNames.includes('updated_at')) {
            await connexion.query('ALTER TABLE rides ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
          }

          // ✅ [FIX] Colonnes pour la soutenance (Finance & Risque)
          if (!columnNames.includes('commission')) await connexion.query('ALTER TABLE rides ADD COLUMN commission DECIMAL(10,2) DEFAULT 0');
          if (!columnNames.includes('risk_score')) await connexion.query('ALTER TABLE rides ADD COLUMN risk_score DECIMAL(5,2) DEFAULT 0');
          if (!columnNames.includes('payment_status')) await connexion.query("ALTER TABLE rides ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING'");
          
          // ✅ [SOUTENANCE] Colonnes Finance additionnelles
          if (!columnNames.includes('commission_rate')) await connexion.query('ALTER TABLE rides ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 18.00');
          if (!columnNames.includes('pricing_mode')) await connexion.query("ALTER TABLE rides ADD COLUMN pricing_mode VARCHAR(40) DEFAULT 'STANDARD'");
          if (!columnNames.includes('locked_price')) await connexion.query('ALTER TABLE rides ADD COLUMN locked_price DECIMAL(10,2) DEFAULT NULL');
          if (!columnNames.includes('applied_multiplier')) await connexion.query('ALTER TABLE rides ADD COLUMN applied_multiplier DECIMAL(3,2) DEFAULT 1.00');
          if (!columnNames.includes('vehicle_type')) await connexion.query("ALTER TABLE rides ADD COLUMN vehicle_type VARCHAR(20) DEFAULT 'Classic' AFTER status");
        }

        if (table === 'pois') {
          if (!columnNames.includes('is_certified')) await connexion.query('ALTER TABLE pois ADD COLUMN is_certified TINYINT(1) DEFAULT 0');
        }

        if (table === 'pricing_settings' && !columnNames.includes('base_fare')) {
          await connexion.query('ALTER TABLE pricing_settings ADD COLUMN base_fare INT DEFAULT 0');
        }

        if (table === 'sms_resilience_logs') {
          if (!columnNames.includes('phone_number')) await connexion.query('ALTER TABLE sms_resilience_logs ADD COLUMN phone_number VARCHAR(20)');
          if (!columnNames.includes('user_id')) await connexion.query('ALTER TABLE sms_resilience_logs ADD COLUMN user_id INT');
          if (!columnNames.includes('heading')) await connexion.query('ALTER TABLE sms_resilience_logs ADD COLUMN heading FLOAT');
          if (!columnNames.includes('speed')) await connexion.query('ALTER TABLE sms_resilience_logs ADD COLUMN speed FLOAT');
          if (!columnNames.includes('raw_message')) await connexion.query('ALTER TABLE sms_resilience_logs ADD COLUMN raw_message TEXT');
        }

        if (table === 'alerts') {
          if (!columnNames.includes('is_listening_active')) await connexion.query('ALTER TABLE alerts ADD COLUMN is_listening_active TINYINT(1) DEFAULT 0');
          // ✅ [FIX] Colonne pour le dashboard Crisis Center
          if (!columnNames.includes('risk_score')) await connexion.query('ALTER TABLE alerts ADD COLUMN risk_score DECIMAL(5,2) DEFAULT 0');
          if (!columnNames.includes('severity')) await connexion.query("ALTER TABLE alerts ADD COLUMN severity VARCHAR(30) DEFAULT 'LOW'");
          if (!columnNames.includes('message')) await connexion.query("ALTER TABLE alerts ADD COLUMN message TEXT DEFAULT NULL");
          if (!columnNames.includes('triggered_at')) await connexion.query("ALTER TABLE alerts ADD COLUMN triggered_at DATETIME DEFAULT NULL");
        }

        if (table === 'ride_status_history') {
          if (!columnNames.includes('details')) await connexion.query('ALTER TABLE ride_status_history ADD COLUMN details JSON DEFAULT NULL');
          if (!columnNames.includes('old_status')) await connexion.query('ALTER TABLE ride_status_history ADD COLUMN old_status VARCHAR(50) DEFAULT NULL');
          if (!columnNames.includes('new_status')) await connexion.query('ALTER TABLE ride_status_history ADD COLUMN new_status VARCHAR(50) DEFAULT NULL');
        }

        if (table === 'user_reputation') {
          if (!columnNames.includes('strike_count')) await connexion.query('ALTER TABLE user_reputation ADD COLUMN strike_count INT DEFAULT 0');
          if (!columnNames.includes('is_blocked')) await connexion.query('ALTER TABLE user_reputation ADD COLUMN is_blocked TINYINT(1) DEFAULT 0');
        }
      }
      if (!hasMigrationRun) {
          console.log("✅ Migration des colonnes (polyline, finance, otp, positions) réussie.");
        
        // 📊 [DIAGNOSTIC] Compter les utilisateurs
        const [userCount] = await connexion.query('SELECT COUNT(*) as count FROM users');
        console.log(`📊 [DATABASE] Nombre d'utilisateurs actifs: ${userCount[0].count}`);
        
        hasMigrationRun = true;
      }
    } catch (migErr) {
      console.warn('⚠️ Erreur mineure de migration :', migErr.message);
    }

    connexion.release();
  } catch (erreur) {
    isMySQLConnected = false;
    if (erreur.code === 'ECONNREFUSED') {
      console.error('❌ [DATABASE] Échec de connexion : MySQL (XAMPP) semble éteint sur 127.0.0.1:3306');
    } else {
      console.error('❌ Erreur de connexion à la base de données :', erreur.message);
    }
  }
}

// Lancer la vérification initiale
verifierConnexion();

// Vérification périodique (Heartbeat) pour auto-reconnexion
setInterval(verifierConnexion, 30000); // Toutes les 30s

module.exports = {
  query: (...args) => poolConnexion.query(...args).catch(err => {
    if (err.code === 'ECONNREFUSED') isMySQLConnected = false;
    throw err;
  }),
  execute: (...args) => poolConnexion.execute(...args).catch(err => {
    if (err.code === 'ECONNREFUSED') isMySQLConnected = false;
    throw err;
  }),
  getConnection: () => poolConnexion.getConnection().catch(err => {
    if (err.code === 'ECONNREFUSED') isMySQLConnected = false;
    throw err;
  }),
  getIsConnected: () => isMySQLConnected,
  pool: poolConnexion
};
