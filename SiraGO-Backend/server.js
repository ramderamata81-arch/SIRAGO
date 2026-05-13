const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');

// Importation de la configuration de la base de données
const baseDeDonnees = require('./config/db');

// Initialisation de l'application Express
const application = express();

// Configuration des Middlewares (Logiciels intermédiaires)

// 1. Sécurité avec Helmet : Protège l'application en configurant divers en-têtes HTTP
// On désactive la politique stricte de ressources croisées pour permettre au frontend de charger les images
application.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 2. CORS (Cross-Origin Resource Sharing) : Permet à l'application React Native de communiquer avec ce serveur
// En production, on restreindra l'origine, mais pour le dev on accepte tout ou localhost
application.use(cors());

// 3. Parser JSON : Permet de lire les données envoyées au format JSON dans les requêtes (req.body)
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

// Servir les fichiers téléchargés (Images KYC)
application.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ [ADMIN WAR ROOM] Servir les fichiers statiques de l'admin
// Si le dossier dist existe (après npm run build dans Sira-go-Admin/admin-pro)
const adminPath = path.join(__dirname, 'Sira-go-Admin', 'admin-pro', 'dist');
application.use('/admin-webapp', express.static(adminPath));

// Pour le SPA (Single Page Application) React/Vite
application.get(/^\/admin-webapp(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(adminPath, 'index.html'));
});

application.use((req, res, next) => {
    const logInfo = `📡 [${new Date().toISOString()}] ${req.method} ${req.url} (IP: ${req.ip})\n`;
    require('fs').appendFileSync('socket_debug.log', logInfo);
    
    if (!req.url.startsWith('/api/admin/')) {
        console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
});

// Importation des fichiers de routes
const routesAuthentification = require('./routes/authRoutes');
const routesAdministration = require('./routes/adminRoutes');
const routesPointsInteret = require('./routes/pois');
const routesChauffeurs = require('./routes/driverRoutes');
const routesCourses = require('./routes/rideRoutes');
const routesResilience = require('./routes/resilienceRoutes');
const routesContacts = require('./routes/trustedContactRoutes');
const routesAlertes = require('./routes/alertRoutes');
const routesPaiements = require('./routes/paymentRoutes');
const routesSecurite = require('./routes/securityRoutes');

const routesRoutes = require('./routes/routeRoutes');
const routesTrips = require('./routes/tripRoutes');
const routesWallet = require('./routes/walletRoutes');
const routesShare = require('./routes/shareRoute');
const routesOffline = require('./routes/offlineSync');
const routesRating = require('./routes/ratingRoutes');
const routesSms = require('./routes/smsWebhook');
const routesUser = require('./routes/userRoutes');
const routesRecordings = require('./routes/recordingRoutes');

// Utilisation des routes
// Liaison des chemins d'API aux fichiers de routes
application.use('/api/auth', routesAuthentification);
application.use('/api/admin', routesAdministration);
application.use('/api/pois', routesPointsInteret);
application.use('/api/drivers', routesChauffeurs);
application.use('/api/rides', routesCourses);
application.use('/api/resilience', routesResilience);
application.use('/api/contacts', routesContacts);
application.use('/api/alerts', routesAlertes);
application.use('/api/payments', routesPaiements);
application.use('/api/security', routesSecurite);
application.use('/api/route', routesRoutes);
application.use('/api/trip', routesTrips);
application.use('/api/wallet', routesWallet);
application.use('/api/share', routesShare);
application.use('/api/rides', routesShare); // Pour le POST /:id/share
application.use('/api/rides', routesOffline);
application.use('/api', routesRating);
application.use('/api/sms', routesSms);
application.use('/api/users', routesUser);
application.use('/api/recordings', routesRecordings);

application.get(['/api/ping', '/api/health'], (req, res) => {
    console.log('📶 Health Check reçu depuis un appareil distant');
    res.json({ status: 'ok', message: 'Le backend SiraGO est accessible !', time: new Date() });
});

// Diagnostic Socket.IO
application.get('/api/admin/sockets/debug', (req, res) => {
    const { obtenirIO } = require('./utils/socketService');
    const io = obtenirIO();
    if (!io) return res.status(500).json({ status: 'error', message: 'Socket.IO non initialisé' });

    const rooms = {};
    for (const [name, set] of io.sockets.adapter.rooms) {
        rooms[name] = { count: set.size, members: Array.from(set) };
    }

    res.json({
        total_connections: io.sockets.sockets.size,
        rooms: rooms,
        timestamp: new Date()
    });
});
// Documentation API
application.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
    console.error('❌ [GLOBAL ERROR]', erreur.stack);
    reponse.status(500).json({
        message: 'Une erreur interne est survenue',
        erreur: erreur.message,
        stack: erreur.stack
    });
});

// Démarrage du serveur et initialisation de Socket.io
const PORT = process.env.PORT || 5000;
const http = require('http');
const serveur = http.createServer(application);
// Initialisation des WebSockets
const socketService = require('./utils/socketService');
socketService.initialiserSocket(serveur);

// ✅ NOUVEAU : Initialisation du Watchdog GPS Fallback (Hybride)
const driveSimEnabled = process.env.ENABLE_DRIVE_SIMULATION === 'true' || process.env.ENABLE_DRIVE_SIMULATION === undefined;
if (driveSimEnabled) {
    const simulationFallback = require('./services/simulationFallback');
    simulationFallback.initWatchdog();
} else {
    console.log('🛰️ [WATCHDOG] Simulation de conduite désactivée (ENABLE_DRIVE_SIMULATION=false)');
}

// ✅ [SIRAGO V2] Initialisation du Watchdog Anti-Chauffeur Fantôme (Abidjan)
if (process.env.ENABLE_PHANTOM_WATCHDOG === 'true') {
    const phantomWatchdog = require('./services/phantomWatchdog');
    phantomWatchdog.start(socketService.obtenirIO());
}

// ✅ [BOOT] Nettoyage initial maintenant géré centralement dans config/db.js

// 🎭 [DEMO] Route de simulation de déviation (jury / démonstration)
if (process.env.DEMO_MODE === 'true') {
    const socketSvc = require('./utils/socketService');
    application.post('/api/demo/simulate-deviation', async (req, res) => {
        try {
            const { rideId } = req.body;
            if (!rideId) return res.status(400).json({ success: false, error: 'rideId requis' });
            // Position simulée hors itinéraire (~500m de décalage typique Abidjan)
            const fakePosition = { lat: 5.4200, lng: -4.0350 };
            await socketSvc.checkDeviation(rideId, fakePosition.lat, fakePosition.lng);
            console.log(`🎭 [DEMO] Déviation simulée pour ride ${rideId}`);
            res.json({ success: true, message: 'Déviation simulée', position: fakePosition });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    application.post('/api/demo/simulate-traffic-jam', async (req, res) => {
        try {
            const { rideId } = req.body;
            if (!rideId) return res.status(400).json({ success: false, error: 'rideId requis' });

            const db = require('./config/db');
            const [rows] = await db.query('SELECT trip_polyline, current_lat, current_lng FROM rides WHERE id = ?', [rideId]);
            if (!rows || rows.length === 0) return res.status(404).json({ success: false, error: 'Ride non trouvé' });

            const ride = rows[0];
            const polyline = require('@mapbox/polyline');
            let points = [];
            if (ride.trip_polyline) {
                try {
                    const parsed = JSON.parse(ride.trip_polyline);
                    points = parsed.map(p => ({ lat: p.latitude || p.lat, lng: p.longitude || p.lng }));
                } catch (e) {
                    const decoded = polyline.decode(ride.trip_polyline);
                    points = decoded.map(p => ({ lat: p[0], lng: p[1] }));
                }
            }

            if (points.length < 10) return res.status(400).json({ success: false, error: 'Itinéraire trop court pour simuler un bouchon' });

            // On prend un segment de 5-10 points situé un peu après la position actuelle
            // Pour la démo, on prend arbitrairement le milieu du trajet
            const startIdx = Math.floor(points.length / 2);
            const endIdx = Math.min(startIdx + 8, points.length - 1);
            const jamCoords = points.slice(startIdx, endIdx).map(p => ({ latitude: p.lat, longitude: p.lng }));

            const io = socketSvc.obtenirIO();
            const cleanId = String(rideId).replace('TRIP-', '').replace('RIDE-', '');
            
            io.to(`ride_${cleanId}`).emit('TRAFFIC_JAM', {
                message: "Alerte : Embouteillage critique sur 800m. Recalcul d'itinéraire conseillé.",
                jamCoords: jamCoords
            });

            console.log(`🎭 [DEMO] Embouteillage (segment rouge) simulé pour ride ${cleanId}`);
            res.json({ success: true, message: 'Embouteillage simulé', jamCoords });

        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });
    console.log('🎭 [DEMO] Route simulation déviation activée → POST /api/demo/simulate-deviation');
}

// Lancement du serveur
serveur.listen(PORT, () => {
    console.log(`🚀 Serveur SiraGO (avec WebSockets) démarré sur le port ${PORT}`);
    console.log(`📡 URL locale : http://localhost:${PORT}`);

    // Afficher les IPs locales pour aider le développeur mobile
    const interfaces = os.networkInterfaces();
    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│ 📶  ADRESSES IP DISPONIBLES POUR LE MOBILE             │');
    console.log('├─────────────────────────────────────────────────────────┤');
    
    let foundIPs = 0;
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4') {
                const tag = iface.internal ? '🏠 [Interne]' : '🌐 [RÉSEAU]';
                const padding = " ".repeat(Math.max(0, 15 - iface.address.length));
                console.log(`│ 👉 http://${iface.address}:${PORT}${padding} ${tag}        │`);
                if (!iface.internal) foundIPs++;
            }
        }
    }
    
    if (foundIPs === 0) {
        console.log('│ ⚠️  AUCUNE IP RÉSEAU DÉTECTÉE. Vérifiez votre Wi-Fi.   │');
    }
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log(`💡 Note : Utilisez http://10.0.2.2:${PORT} pour l'émulateur Android.\n`);
});

// Gestion gracieuse du port déjà utilisé (EADDRINUSE)
serveur.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Le port ${PORT} est déjà utilisé par un autre processus.`);
        console.error(`💡 Pour résoudre : taskkill /F /PID $(netstat -ano | findstr :${PORT})`);
        console.error(`   Ou redémarrez simplement nodemon.\n`);
        process.exit(1);
    } else {
        throw err;
    }
});
