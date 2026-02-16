const mysql = require('mysql2/promise');
require('dotenv').config();

// Création du pool de connexions à la base de données
// Utilisation d'un pool pour gérer efficacement plusieurs connexions simultanées
const poolConnexion = mysql.createPool({
  host: process.env.DB_HOST,         // Hôte de la base de données (ex: localhost)
  user: process.env.DB_USER,         // Utilisateur de la base de données (ex: root)
  password: process.env.DB_PASSWORD, // Mot de passe de la base de données
  database: process.env.sirago_db,     // Nom de la base de données (ex: sirago_db)
  waitForConnections: true,          // Attendre si toutes les connexions sont utilisées
  connectionLimit: 10,               // Nombre maximum de connexions dans le pool
  queueLimit: 0                      // Nombre maximum de requêtes en attente (0 = illimité)
});

// Vérification de la connexion au démarrage
async function verifierConnexion() {
  try {
    const connexion = await poolConnexion.getConnection();
    console.log('✅ Connecté avec succès à la base de données MySQL sirago_db');
    connexion.release(); // Libérer la connexion pour qu'elle retourne au pool
  } catch (erreur) {
    console.error('❌ Erreur de connexion à la base de données :', erreur.message);
    // On ne coupe pas le processus ici, mais on log l'erreur critique
  }
}

verifierConnexion();

module.exports = poolConnexion;