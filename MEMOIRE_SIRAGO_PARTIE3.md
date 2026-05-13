
============================================================================
           TROISIÈME PARTIE : RÉALISATION ET RÉSULTATS
============================================================================



============================================================================
       CHAPITRE V : ENVIRONNEMENT TECHNIQUE
============================================================================

--- PAGE 25 ---

V. Présentation des outils et technologies

    Le choix d'une pile technologique adaptée est déterminant pour la réussite d'un projet de 
génie logiciel. Dans le cas de SIRA GO, les contraintes de temps réel, de résilience réseau et de 
compatibilité multiplateforme ont orienté nos décisions vers un ensemble d'outils modernes et 
interopérables.

    >>> INSÉRER ICI : Tableau 6 — Environnement matériel et logiciel de développement <<<

    +---------------------+-------------------------------------------+
    | Composant           | Description                               |
    +---------------------+-------------------------------------------+
    | Système d'exploit.  | Windows 11                                |
    | Processeur          | Intel Core i5 / Ryzen 5 ou supérieur      |
    | Mémoire vive        | 8 Go RAM minimum                          |
    | Éditeur de code     | Visual Studio Code                        |
    | Langage principal   | JavaScript (ES6+)                         |
    | Gestion de paquets  | npm (Node Package Manager)                |
    | Versionnement       | Git / GitHub                              |
    | Test API            | Postman                                   |
    | SGBD                | MySQL 8.0 / phpMyAdmin                    |
    | Modélisation        | StarUML / draw.io                         |
    +---------------------+-------------------------------------------+

    L'architecture du projet s'articule autour de quatre composantes principales :
    l'application mobile, le serveur backend, la base de données et le dashboard d'administration.

--- PAGE 26 ---

V.1. Application mobile : React Native et Expo

    L'application mobile constitue le point d'entrée des passagers et des chauffeurs. Elle a 
été développée avec React Native, un framework open-source de Meta qui permet de créer 
des applications natives pour Android et iOS à partir d'une base de code JavaScript unique.

    Le choix de React Native repose sur trois avantages :
    • Le développement multiplateforme à partir d'un code source unique ;
    • L'accès aux fonctionnalités matérielles du téléphone (GPS, boutons de volume, micro) ;
    • Un écosystème riche de bibliothèques communautaires.

    Le framework Expo a été utilisé comme couche d'abstraction supplémentaire pour 
simplifier la configuration, le build et le déploiement de l'application.

    >>> INSÉRER ICI : Tableau 7 — Bibliothèques principales du frontend mobile <<<

    +---------------------------+-------------------------------------------+
    | Bibliothèque              | Rôle                                      |
    +---------------------------+-------------------------------------------+
    | react-navigation          | Navigation entre les écrans               |
    | react-native-maps         | Affichage de la carte et des marqueurs    |
    | expo-location             | Accès aux données GPS du terminal         |
    | socket.io-client          | Communication temps réel avec le serveur  |
    | @react-native-async-storage| Stockage local persistant                |
    | expo-image-picker         | Sélection et upload de photos/documents   |
    | expo-audio                | Enregistrement et lecture audio            |
    | lucide-react-native       | Icônes vectorielles de l'interface        |
    +---------------------------+-------------------------------------------+

    >>> INSÉRER ICI : Figure 10 — Architecture technique React Native / Expo <<<

--- PAGE 27 ---

V.2. Serveur applicatif : Node.js, Express et Socket.io

    Le serveur backend assure le traitement de la logique métier, la gestion de 
l'authentification, le stockage des données et la coordination des communications temps réel.

    Node.js a été retenu pour sa capacité à gérer un grand nombre de connexions simultanées 
grâce à son modèle événementiel non-bloquant. Express, framework minimaliste pour Node.js, 
fournit la structure de l'API REST avec un système de routes, de contrôleurs et de middlewares.

    Socket.io a été intégré pour gérer l'ensemble des communications bidirectionnelles en 
temps réel : mise à jour des positions GPS, diffusion des alertes, notifications de nouvelles 
courses et synchronisation de l'état des courses entre tous les participants.

    >>> INSÉRER ICI : Tableau 8 — Dépendances du serveur backend <<<

    +---------------------------+-------------------------------------------+
    | Module                    | Rôle                                      |
    +---------------------------+-------------------------------------------+
    | express                   | Framework web / API REST                  |
    | socket.io                 | Serveur WebSocket temps réel              |
    | mysql2/promise            | Pilote MySQL avec support async/await     |
    | bcryptjs                  | Hachage sécurisé des mots de passe        |
    | jsonwebtoken              | Génération et vérification des tokens JWT |
    | multer                    | Gestion des uploads de fichiers           |
    | helmet                    | Sécurisation des en-têtes HTTP            |
    | cors                      | Gestion des requêtes cross-origin         |
    | dotenv                    | Chargement des variables d'environnement  |
    +---------------------------+-------------------------------------------+

    >>> INSÉRER ICI : Figure 11 — Flux de communication Socket.io <<<

    L'architecture serveur suit le pattern MVC (Modèle-Vue-Contrôleur) adapté :
    • Routes : définition des points d'entrée de l'API
    • Contrôleurs : logique de traitement des requêtes
    • Services : logique métier réutilisable (tracking, sécurité)
    • Middlewares : authentification JWT et vérification des rôles

--- PAGE 28 ---

V.3. Stockage des données : MySQL

    MySQL 8.0 a été choisi comme système de gestion de base de données relationnelle pour 
sa fiabilité, ses performances et sa compatibilité avec l'écosystème Node.js via le pilote 
mysql2/promise.

    La base de données sirago_db comprend 11 tables organisées autour de trois domaines 
fonctionnels :

    • Domaine Utilisateurs : users, drivers, trusted_contacts, deposits
    • Domaine Opérationnel : rides, ride_tracking, pois
    • Domaine Sécurité : alerts, security_verifications
    • Domaine Configuration : settings, global_settings

    >>> INSÉRER ICI : Tableau 9 — Structure de la table users dans MySQL <<<

    +------------------------+------------------+--------------------------+
    | Colonne                | Type             | Description              |
    +------------------------+------------------+--------------------------+
    | id                     | INT AUTO_INCR.   | Identifiant unique       |
    | full_name              | VARCHAR(255)     | Nom complet              |
    | phone                  | VARCHAR(20) UNI. | Numéro de téléphone      |
    | email                  | VARCHAR(255)     | Adresse email            |
    | password_hash          | VARCHAR(255)     | Mot de passe haché       |
    | role                   | ENUM             | PASSENGER/DRIVER/ADMIN   |
    | sos_real_code_hash     | VARCHAR(255)     | Hash du code SOS réel    |
    | sos_fake_code_hash     | VARCHAR(255)     | Hash du code contrainte  |
    | is_verified            | TINYINT(1)       | Statut de vérification   |
    | created_at             | TIMESTAMP        | Date de création         |
    +------------------------+------------------+--------------------------+

    Le stockage local sur le terminal mobile est assuré par AsyncStorage, qui permet de 
conserver les données de session (token JWT, profil utilisateur) et les données de tracking 
en cas de perte de connexion.

--- PAGE 29 ---

V.4. Interface d'administration : React.js

    Le dashboard d'administration a été développé avec React.js, bibliothèque JavaScript 
de Meta pour la construction d'interfaces web réactives. Ce choix permet une cohérence 
technologique avec le frontend mobile (même langage, même paradigme composant).

    Le dashboard comprend les pages suivantes :
    • Dashboard : vue d'ensemble avec statistiques et carte en temps réel (War Room)
    • KYC : validation des dossiers chauffeurs avec visualisation des documents
    • POI Manager : gestion des Points d'Intérêt (ajout, modification, suppression)
    • Prix & Paramètres : configuration du taux de commission et des seuils

    La communication temps réel entre le dashboard et le serveur utilise le même serveur 
Socket.io que l'application mobile. L'administrateur rejoint automatiquement la salle 
'admin_room' pour recevoir les alertes critiques et les mises à jour de position.
