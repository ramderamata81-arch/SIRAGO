
============================================================================
                       CONCLUSION GÉNÉRALE
============================================================================

--- PAGE 38 ---

    Au terme de ce travail, nous avons conçu et développé SIRA GO, une plateforme mobile 
de gestion de transport VTC intégrant un suivi GPS en temps réel. Ce projet, mené dans le 
cadre de la Licence en Génie Informatique à l'Institut Universitaire d'Abidjan (IUA), avait 
pour ambition de répondre aux lacunes identifiées dans les solutions de transport existantes, 
en particulier leur dépendance totale à la connexion Internet et l'absence de mécanismes de 
sécurité discrets.

    Les objectifs fixés ont été atteints :

    • La résilience hybride a été implémentée avec succès : le système bascule automatiquement 
      sur le réseau SMS lorsque la connexion data est indisponible, garantissant la continuité 
      du suivi GPS. Le webhook de résilience parse les messages au format structuré et les 
      injecte dans le même pipeline de tracking que les données Internet.

    • Le dispositif de sécurité proactive est opérationnel : l'alerte SOS matérielle via les 
      touches de volume et le code de contrainte à réponse furtive permettent de signaler un 
      danger sans attirer l'attention. La réponse HTTP reste neutre (200 OK) quel que soit le 
      code saisi, assurant la discrétion du mécanisme.

    • Le Marketplace ouvert offre au passager le choix de son chauffeur parmi plusieurs 
      propositions, renforçant la transparence et la confiance entre les parties.

    • L'interface d'administration War Room fournit à l'opérateur une vision centralisée et 
      temps réel de l'activité de la plateforme, avec des outils de réaction rapide en cas 
      d'incident.

    Ce projet nous a permis de consolider nos compétences en développement full-stack 
(React Native, Node.js, Socket.io, MySQL), en conception orientée objet (UML) et en 
gestion de projet logiciel.

    Toutefois, certaines perspectives d'amélioration se dessinent :

    • L'intégration d'un module de paiement électronique (Mobile Money, Wave, Orange Money) 
      pour automatiser les transactions financières ;
    • Le renforcement de la cartographie embarquée avec des tuiles vectorielles OpenStreetMap 
      compressées pour un fonctionnement offline complet ;
    • L'ajout d'un module d'intelligence artificielle pour l'estimation tarifaire et la prédiction 
      des temps de trajet ;
    • Le déploiement en production sur un serveur cloud (AWS, DigitalOcean) avec une 
      architecture conteneurisée (Docker) ;
    • L'extension du système à d'autres segments de mobilité (livraison de colis, transport 
      inter-urbain).

    SIRA GO démontre qu'il est possible de concevoir une solution technique adaptée aux 
réalités infrastructurelles de l'Afrique de l'Ouest, en transformant les contraintes du terrain 
en opportunités d'innovation.

--- PAGE 39 ---



============================================================================
                           ANNEXES
============================================================================

ANNEXE A : Principaux endpoints de l'API REST

    +--------+------------------------------------+---------------------------+
    | Méth.  | Endpoint                           | Description               |
    +--------+------------------------------------+---------------------------+
    | POST   | /api/auth/inscription/passager     | Inscription passager      |
    | POST   | /api/auth/inscription/chauffeur    | Inscription chauffeur     |
    | POST   | /api/auth/connexion                | Connexion                 |
    | GET    | /api/auth/profil                   | Profil utilisateur        |
    | POST   | /api/courses/demander              | Demander une course       |
    | PUT    | /api/courses/:id/offre             | Proposer une offre        |
    | PUT    | /api/courses/:id/accepter          | Accepter une offre        |
    | PUT    | /api/courses/:id/arrive            | Signaler l'arrivée        |
    | PUT    | /api/courses/:id/demarrer          | Démarrer la course        |
    | PUT    | /api/courses/:id/terminer          | Terminer la course        |
    | PUT    | /api/courses/:id/annuler           | Annuler la course         |
    | POST   | /api/securite/verifier             | Vérifier code SOS         |
    | POST   | /api/securite/sos                  | Déclencher alerte SOS     |
    | POST   | /api/alertes                       | Créer une alerte          |
    | GET    | /api/alertes/:id                   | Détails d'une alerte      |
    | GET    | /api/poi                           | Liste des POI             |
    | POST   | /api/poi                           | Créer un POI (admin)      |
    | PUT    | /api/poi/:id                       | Modifier un POI           |
    | DELETE | /api/poi/:id                       | Supprimer un POI          |
    | POST   | /api/resilience/webhook-sms        | Webhook SMS               |
    | GET    | /api/admin/statistiques            | Stats globales            |
    | GET    | /api/admin/chauffeurs/en-attente   | Chauffeurs KYC pending    |
    | PUT    | /api/admin/chauffeurs/:id/statut   | Modifier statut KYC      |
    | GET    | /api/admin/courses                 | Liste toutes les courses  |
    | GET    | /api/admin/alertes                 | Alertes actives           |
    +--------+------------------------------------+---------------------------+

--- PAGE 40 ---

ANNEXE B : Schéma SQL (tables principales)

    ```sql
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('PASSENGER','DRIVER','ADMIN') DEFAULT 'PASSENGER',
        sos_real_code_hash VARCHAR(255),
        sos_fake_code_hash VARCHAR(255),
        is_verified TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE drivers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        license_url VARCHAR(500),
        id_card_url VARCHAR(500),
        registration_card_url VARCHAR(500),
        criminal_record_url VARCHAR(500),
        vehicle_model VARCHAR(255),
        license_plate VARCHAR(50),
        verification_status ENUM('pending_verification','approved',
            'rejected','suspended') DEFAULT 'pending_verification',
        admin_notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE rides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        passenger_id INT NOT NULL,
        driver_id INT,
        pickup_lat DECIMAL(10,8),
        pickup_lng DECIMAL(11,8),
        destination_lat DECIMAL(10,8),
        destination_lng DECIMAL(11,8),
        destination_address VARCHAR(500),
        poi_id INT,
        status ENUM('REQUESTED','ACCEPTED','ARRIVED',
            'IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'REQUESTED',
        proposed_price DECIMAL(10,2),
        final_price DECIMAL(10,2),
        commission_amount DECIMAL(10,2),
        driver_net_income DECIMAL(10,2),
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (passenger_id) REFERENCES users(id),
        FOREIGN KEY (driver_id) REFERENCES users(id),
        FOREIGN KEY (poi_id) REFERENCES pois(id)
    );

    CREATE TABLE alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ride_id INT,
        type ENUM('SOS','DEVIATION','CODE_FAUX','MANUAL') 
            DEFAULT 'SOS',
        status ENUM('OPEN','ACKNOWLEDGED','RESOLVED','CLOSED') 
            DEFAULT 'OPEN',
        message TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (ride_id) REFERENCES rides(id)
    );

    CREATE TABLE ride_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ride_id INT NOT NULL,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        source ENUM('APP_DATA','SMS_FALLBACK') DEFAULT 'APP_DATA',
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides(id)
    );
    ```

--- PAGE 41 ---

ANNEXE C : Événements Socket.io principaux

    +-----------------------------+------------------------------------------+
    | Événement                   | Description                              |
    +-----------------------------+------------------------------------------+
    | NOUVELLE_COURSE             | Diffusion d'une nouvelle demande de      |
    |                             | course à tous les chauffeurs connectés   |
    +-----------------------------+------------------------------------------+
    | OFFRE_CHAUFFEUR             | Un chauffeur soumet une offre de prix    |
    +-----------------------------+------------------------------------------+
    | COURSE_ACCEPTEE             | Le passager a accepté l'offre            |
    +-----------------------------+------------------------------------------+
    | MAJ_POSITION                | Mise à jour de la position GPS (3s)      |
    +-----------------------------+------------------------------------------+
    | check_in_securite           | Demande de vérification de sécurité      |
    +-----------------------------+------------------------------------------+
    | alerte_critique             | Notification d'un danger (SOS, déviation,|
    |                             | code de contrainte)                      |
    +-----------------------------+------------------------------------------+
    | force_mic_on                | Activation de l'écoute micro à distance  |
    +-----------------------------+------------------------------------------+
    | join_admin_room             | L'admin rejoint la salle de surveillance |
    +-----------------------------+------------------------------------------+



============================================================================
                          GLOSSAIRE
============================================================================

    • API : Application Programming Interface — interface de programmation permettant 
      l'échange de données entre applications.

    • AsyncStorage : Module de stockage local persistant pour React Native, utilisé comme 
      base de données clé-valeur sur le terminal mobile.

    • bcryptjs : Bibliothèque de hachage cryptographique pour la sécurisation des mots de 
      passe et des codes de sécurité.

    • Cross-track distance : Formule de géodésie permettant de calculer la distance 
      perpendiculaire entre un point et un segment (utilisée pour la détection de déviation).

    • Expo : Plateforme de développement qui simplifie la création d'applications React Native 
      en fournissant un ensemble d'outils et de services préconfigurés.

    • GPS : Global Positioning System — système de géolocalisation par satellite.

    • Haversine : Formule trigonométrique de calcul de la distance entre deux points sur la 
      surface d'une sphère, utilisée pour les distances géographiques.

    • JWT : JSON Web Token — standard ouvert de transmission sécurisée d'informations 
      entre parties sous forme de jeton signé.

    • KYC : Know Your Customer — processus de vérification de l'identité d'un client, ici 
      appliqué aux chauffeurs pour garantir la conformité de leur dossier.

    • MVC : Modèle-Vue-Contrôleur — patron d'architecture logicielle séparant la logique 
      métier, la présentation et le contrôle du flux.

    • Node.js : Environnement d'exécution JavaScript côté serveur, basé sur le moteur V8 de 
      Google Chrome. Sa boucle événementielle non-bloquante le rend adapté aux applications 
      temps réel.

    • POI : Point Of Interest — point d'intérêt géolocalisé (pharmacie, commissariat, etc.) 
      servant de repère certifié pour le Smart Pickup.

    • RBAC : Role-Based Access Control — contrôle d'accès basé sur les rôles, utilisé pour 
      différencier les permissions entre Passager, Chauffeur et Administrateur.

    • React Native : Framework open-source de Meta pour le développement d'applications 
      mobiles natives en JavaScript.

    • SMS Fallback : Mécanisme de basculement automatique sur le réseau SMS pour maintenir 
      le tracking GPS en cas de perte de connexion Internet.

    • Socket.io : Bibliothèque JavaScript permettant la communication bidirectionnelle en 
      temps réel entre un client et un serveur (WebSocket).

    • UML : Unified Modeling Language — langage de modélisation graphique utilisé pour 
      formaliser la conception des systèmes logiciels.

    • VTC : Véhicule de Transport avec Chauffeur — service de transport de personnes 
      commandé via une application mobile.

    • War Room : Appellation interne du dashboard d'administration en temps réel, offrant 
      une vision globale et opérationnelle de la plateforme.

    • WebSocket : Protocole de communication réseau permettant des échanges bidirectionnels 
      en temps réel entre un navigateur (ou application) et un serveur.

    • Webhook : Point d'entrée HTTP utilisé pour recevoir des notifications automatiques 
      d'un service externe (ici, les SMS de résilience).

    • Zone blanche : Zone géographique où la couverture réseau mobile (3G/4G) est absente 
      ou insuffisante pour maintenir une connexion data.

--- PAGE 42 ---



============================================================================
                    BIBLIOGRAPHIE / WEBOGRAPHIE
============================================================================

Ouvrages et articles :

[1] LANGAGE UML — P. ROQUES, F. VALLÉE, « UML 2 en action : De l'analyse des 
    besoins à la conception », Eyrolles, 5e édition, 2007.

[2] ARCHITECTURE LOGICIELLE — M. FOWLER, « Patterns of Enterprise Application 
    Architecture », Addison-Wesley, 2002.

[3] SÉCURITÉ DES APPLICATIONS — A. SHOSTACK, « Threat Modeling: Designing for 
    Security », Wiley, 2014.

[4] TRANSPORT URBAIN EN AFRIQUE — Banque Mondiale, « Mobility in African Cities: 
    Enabling Smart Urban Growth through Technology », Rapport technique, 2022.

[5] RÉSEAUX MOBILES EN AFRIQUE DE L'OUEST — GSMA Intelligence, « The Mobile 
    Economy: Sub-Saharan Africa 2023 », 2023.

[6] GÉOLOCALISATION — K. EL-RABBANY, « Introduction to GPS: The Global Positioning 
    System », Artech House, 2002.


Documentation technique en ligne :

[7] React Native — Documentation officielle
    https://reactnative.dev/docs/getting-started

[8] Expo — Documentation officielle
    https://docs.expo.dev/

[9] Node.js — Documentation officielle
    https://nodejs.org/docs/latest/api/

[10] Express.js — Guide officiel
     https://expressjs.com/fr/guide/

[11] Socket.io — Documentation officielle
     https://socket.io/docs/v4/

[12] MySQL 8.0 — Manuel de référence
     https://dev.mysql.com/doc/refman/8.0/en/

[13] JSON Web Tokens — Introduction
     https://jwt.io/introduction/

[14] bcrypt.js — Bibliothèque de hachage
     https://www.npmjs.com/package/bcryptjs

[15] Multer — Middleware de gestion de fichiers
     https://www.npmjs.com/package/multer

[16] React.js — Documentation officielle
     https://react.dev/

[17] OpenStreetMap — Projet de cartographie collaborative
     https://www.openstreetmap.org/

[18] Formule de Haversine — Calcul de distance géographique
     https://en.wikipedia.org/wiki/Haversine_formula

[19] ARTCI — Autorité de Régulation des Télécommunications de Côte d'Ivoire
     https://www.artci.ci/
