const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importation de la configuration de la base de données
const db = require('./config/db');

// Initialisation de l'application Express
const application = express();

// Configuration des Middlewares (Logiciels intermédiaires)

// 1. Sécurité avec Helmet : Protège l'application en configurant divers en-têtes HTTP
application.use(helmet());

// 2. CORS (Cross-Origin Resource Sharing) : Permet à l'application React Native de communiquer avec ce serveur
// En production, on restreindra l'origine, mais pour le dev on accepte tout ou localhost
application.use(cors());

// 3. Parser JSON : Permet de lire les données envoyées au format JSON dans les requêtes (req.body)
application.use(express.json());

// 4. Parser URL-encoded : Permet de lire les données envoyées via des formulaires classiques
application.use(express.urlencoded({ extended: true }));


// Route de test pour vérifier que le serveur fonctionne
application.get('/', (requete, reponse) => {
    reponse.json({
        message: 'Bienvenue sur l\'API SiraGO !',
        statut: 'En ligne',
        timestamp: new Date()
    });
});

// Gestion des erreurs globale (Middleware de fin)
application.use((erreur, requete, reponse, next) => {
    console.error(erreur.stack);
    reponse.status(500).json({
        message: 'Une erreur interne est survenue',
        erreur: process.env.NODE_ENV === 'development' ? erreur.message : undefined
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
application.listen(PORT, () => {
    console.log(`🚀 Serveur SiraGO démarré sur le port ${PORT}`);
    console.log(`📡 URL locale : http://localhost:${PORT}`);
});
