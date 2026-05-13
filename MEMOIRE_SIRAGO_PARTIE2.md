
============================================================================
           DEUXIÈME PARTIE : CONCEPTION DU SYSTÈME
============================================================================



============================================================================
         CHAPITRE III : SPÉCIFICATION DES BESOINS
============================================================================

--- PAGE 11 ---

III. Identification des acteurs et de leurs attentes

    La conception d'un système logiciel robuste passe nécessairement par une phase 
d'identification précise des utilisateurs et de leurs exigences. Dans le cas de SIRA GO, trois 
catégories d'acteurs interagissent avec la plateforme, chacune ayant des droits, des 
responsabilités et des besoins spécifiques.

    Les trois profils identifiés sont :

    • Le Passager — utilisateur final qui commande et suit sa course
    • Le Chauffeur — prestataire de service qui reçoit et exécute les courses
    • L'Administrateur — gestionnaire de la plateforme qui supervise l'ensemble des opérations

    La section qui suit détaille les besoins fonctionnels par profil ainsi que les contraintes 
non-fonctionnelles transversales au système.

--- PAGE 12 ---

III.1. Besoins du profil Passager

    Le passager est l'acteur central de la plateforme. Ses attentes portent à la fois sur la 
facilité d'utilisation, la transparence dans le choix du chauffeur et la garantie de sa sécurité 
tout au long de la course.

    >>> INSÉRER ICI : Tableau 2 — Besoins fonctionnels du profil Passager <<<

    +------+-------------------------------------------------+----------+
    | Réf  | Description du besoin                           | Priorité |
    +------+-------------------------------------------------+----------+
    | BF01 | Créer un compte avec numéro de téléphone        | Haute    |
    | BF02 | Définir un code SOS réel et un code de          | Haute    |
    |      | contrainte lors de l'inscription                |          |
    | BF03 | Commander une course en saisissant sa            | Haute    |
    |      | destination ou en sélectionnant un POI           |          |
    | BF04 | Visualiser les offres de plusieurs chauffeurs    | Haute    |
    |      | sur le Marketplace (prix, note, temps estimé)    |          |
    | BF05 | Choisir librement le chauffeur de son choix      | Haute    |
    | BF06 | Suivre le trajet en temps réel sur la carte      | Haute    |
    | BF07 | Déclencher une alerte SOS via les touches de     | Haute    |
    |      | volume (sans toucher l'écran)                    |          |
    | BF08 | Enregistrer des contacts de confiance pour les   | Moyenne  |
    |      | notifications d'urgence                          |          |
    | BF09 | Répondre au check-in de sécurité avec le code    | Haute    |
    |      | réel ou le code de contrainte                    |          |
    | BF10 | Consulter l'historique de ses courses             | Basse    |
    +------+-------------------------------------------------+----------+

--- PAGE 13 ---

III.2. Besoins du profil Chauffeur

    Le chauffeur est le second acteur opérationnel. Son parcours utilisateur inclut une phase
d'inscription enrichie (vérification KYC) et une utilisation quotidienne centrée sur la réception 
et l'exécution des courses.

    >>> INSÉRER ICI : Tableau 3 — Besoins fonctionnels du profil Chauffeur <<<

    +------+-------------------------------------------------+----------+
    | Réf  | Description du besoin                           | Priorité |
    +------+-------------------------------------------------+----------+
    | BF11 | S'inscrire en fournissant les documents requis  | Haute    |
    |      | (CNI, Permis, Carte grise, Casier judiciaire)   |          |
    | BF12 | Consulter le statut de sa vérification KYC      | Haute    |
    | BF13 | Signer le contrat numérique après approbation   | Haute    |
    | BF14 | Basculer entre le mode en ligne et hors ligne   | Haute    |
    | BF15 | Recevoir les demandes de course en temps réel   | Haute    |
    | BF16 | Proposer un prix et accepter une course         | Haute    |
    | BF17 | Naviguer vers le passager et la destination     | Haute    |
    | BF18 | Déclencher le SOS matériel en cas de danger     | Haute    |
    | BF19 | Répondre au check-in de sécurité                | Haute    |
    | BF20 | Consulter ses gains et son historique            | Moyenne  |
    +------+-------------------------------------------------+----------+

--- PAGE 14 ---

III.3. Besoins du profil Administrateur

    L'administrateur dispose d'une vue globale sur l'ensemble de la plateforme. Son interface 
principale est le Dashboard War Room, un tableau de bord web en temps réel.

    >>> INSÉRER ICI : Tableau 4 — Besoins fonctionnels du profil Administrateur <<<

    +------+-------------------------------------------------+----------+
    | Réf  | Description du besoin                           | Priorité |
    +------+-------------------------------------------------+----------+
    | BF21 | Se connecter au dashboard d'administration      | Haute    |
    | BF22 | Consulter les statistiques globales de la       | Haute    |
    |      | plateforme (courses, chauffeurs, revenus)        |          |
    | BF23 | Valider ou rejeter les dossiers KYC des         | Haute    |
    |      | chauffeurs avec annotation par document          |          |
    | BF24 | Visualiser les positions de tous les véhicules  | Haute    |
    |      | actifs sur la carte en temps réel                |          |
    | BF25 | Recevoir les alertes critiques (SOS, déviation, | Haute    |
    |      | code de contrainte) instantanément               |          |
    | BF26 | Activer l'écoute micro à distance sur un        | Haute    |
    |      | terminal ciblé                                   |          |
    | BF27 | Gérer les Points d'Intérêt (CRUD)               | Moyenne  |
    | BF28 | Configurer les paramètres de la plateforme      | Moyenne  |
    |      | (taux de commission, seuils de déviation)        |          |
    | BF29 | Consulter l'historique complet des courses       | Moyenne  |
    | BF30 | Gérer les dépôts financiers des chauffeurs      | Basse    |
    +------+-------------------------------------------------+----------+

--- PAGE 15 ---

III.4. Contraintes non-fonctionnelles

    Au-delà des fonctionnalités métier, le système doit satisfaire un ensemble de contraintes 
techniques et qualitatives qui conditionnent sa viabilité en environnement réel.

    >>> INSÉRER ICI : Tableau 5 — Contraintes non-fonctionnelles du système <<<

    +----------------+---------------------------------------------------+
    | Catégorie      | Exigence                                          |
    +----------------+---------------------------------------------------+
    | Sécurité       | Hachage de tous les mots de passe et codes SOS    |
    |                | avec bcryptjs (salt factor 10)                    |
    +----------------+---------------------------------------------------+
    | Sécurité       | Authentification par token JWT avec expiration     |
    |                | configurable (30 jours par défaut)                 |
    +----------------+---------------------------------------------------+
    | Sécurité       | Protection des en-têtes HTTP via Helmet.js         |
    +----------------+---------------------------------------------------+
    | Performance    | Transmission des positions GPS toutes les 3        |
    |                | secondes via Socket.io                             |
    +----------------+---------------------------------------------------+
    | Performance    | Temps de réponse de l'API inférieur à 500ms        |
    +----------------+---------------------------------------------------+
    | Résilience     | Basculement automatique sur SMS en cas de perte    |
    |                | de la connexion Internet                           |
    +----------------+---------------------------------------------------+
    | Résilience     | Conservation des données de position dans la       |
    |                | mémoire locale (AsyncStorage) en mode offline      |
    +----------------+---------------------------------------------------+
    | Compatibilité  | Fonctionnement sur Android et iOS grâce à React   |
    |                | Native / Expo                                      |
    +----------------+---------------------------------------------------+
    | Maintenabilité | Architecture MVC avec séparation claire entre      |
    |                | contrôleurs, services, routes et middlewares       |
    +----------------+---------------------------------------------------+
    | Ergonomie      | Interface utilisateur intuitive, adaptée aux       |
    |                | habitudes de navigation des utilisateurs locaux    |
    +----------------+---------------------------------------------------+

--- PAGE 16 ---

    La prise en compte de ces contraintes a guidé l'ensemble de nos choix technologiques et 
architecturaux, comme nous le verrons dans la troisième partie de ce mémoire.



============================================================================
          CHAPITRE IV : ANALYSE ET CONCEPTION
============================================================================

--- PAGE 17 ---

IV.1. PRÉSENTATION DES MÉTHODES ET DU LANGAGE DE MODÉLISATION

1) La méthode MERISE
   La méthode MERISE (Méthode d'Étude et de Réalisation Informatique par les Sous-Ensembles) est une approche d'analyse et de conception de systèmes d'information dite "classique". Elle repose sur la séparation stricte des données (ce que le système stocke) et des traitements (ce que le système fait).
   • Forces : Excellente pour la modélisation de bases de données relationnelles complexes et structuration rigoureuse (MCD, MLD, MPD).
   • Faiblesses : Sa rigidité et son approche linéaire la rendent inadaptée aux projets interactifs modernes et aux langages orientés objet.

2) Le langage UML (Unified Modeling Language)
   UML n'est pas une méthode mais un langage de modélisation universel. Il fournit un ensemble de symboles et de diagrammes normalisés pour visualiser, spécifier et documenter un système logiciel.
   • Forces : Standard international, orienté objet, et indépendant du langage de programmation tout en étant proche du code moderne (JS, Java).
   • Faiblesses : La richesse de sa notation peut être complexe à maîtriser dans son intégralité.

IV.2. CHOIX DE LA MÉTHODE ET JUSTIFICATION

   Pour la conception de SiraGO, nous avons adopté la méthode UP (Unified Process) couplée au langage UML. Ce choix se justifie par les points suivants :

1) Comparaison entre UML et MERISE
   La principale différence réside dans l'approche : Merise sépare les données des traitements, tandis qu'UML les regroupe au sein d'objets. UML offre une modélisation comportementale (dynamique) bien plus riche que Merise, ce qui est crucial pour un système de transport en temps réel.

2) Pourquoi choisir UML au lieu de MERISE ?
   Nous avons privilégié UML car SiraGO utilise des technologies modernes (React Native, Node.js) basées sur la programmation orientée objet. UML permet de modéliser avec précision les flux complexes (tracking GPS, alertes SOS) via des diagrammes de séquence, là où Merise se limiterait à une vision statique des données.

IV.3. ANALYSE ET MODÉLISATION DES ASPECTS DU SYSTÈME
   Cette phase consiste à structurer les fondations logiques du projet à travers trois types de diagrammes complémentaires :

   • Les diagrammes de cas d'utilisation, pour les interactions acteurs-système ;
   • Le diagramme de classes, pour la structure statique des données ;
   • Les diagrammes de séquence, pour le comportement dynamique des scénarios critiques.

--- PAGE 18 ---

IV.1. Diagrammes des cas d'utilisation

    Trois diagrammes de cas d'utilisation ont été réalisés, un par profil utilisateur.

    >>> INSÉRER ICI : Figure 3 — Diagramme des cas d'utilisation — Passager <<<

    Description textuelle du cas d'utilisation « Commander une course » :

    +------------------+-----------------------------------------------+
    | Élément          | Détail                                        |
    +------------------+-----------------------------------------------+
    | Nom              | Commander une course                          |
    | Acteur principal | Passager                                      |
    | Pré-condition    | Le passager est authentifié et géolocalisé     |
    | Scénario nominal | 1. Le passager saisit sa destination           |
    |                  | 2. Le système suggère des POI proches          |
    |                  | 3. Le passager valide le point de départ       |
    |                  | 4. La demande est diffusée aux chauffeurs      |
    |                  | 5. Le passager reçoit des offres               |
    |                  | 6. Le passager sélectionne un chauffeur         |
    | Post-condition   | La course est créée avec le statut ACCEPTED    |
    | Scénario altern. | Aucun chauffeur disponible : notification      |
    +------------------+-----------------------------------------------+

--- PAGE 19 ---

    >>> INSÉRER ICI : Figure 4 — Diagramme des cas d'utilisation — Chauffeur <<<

    Description textuelle du cas d'utilisation « S'inscrire en tant que chauffeur » :

    +------------------+-----------------------------------------------+
    | Élément          | Détail                                        |
    +------------------+-----------------------------------------------+
    | Nom              | S'inscrire en tant que chauffeur               |
    | Acteur principal | Chauffeur                                     |
    | Pré-condition    | Le chauffeur dispose des documents requis      |
    | Scénario nominal | 1. Saisie des informations personnelles        |
    |                  | 2. Upload des 4 documents (CNI, Permis,        |
    |                  |    Carte grise, Casier judiciaire)              |
    |                  | 3. Définition des codes SOS                    |
    |                  | 4. Soumission du dossier                       |
    |                  | 5. Compte créé avec statut pending_verification |
    | Post-condition   | Le dossier est en attente de validation admin  |
    | Scénario altern. | Document manquant : message d'erreur           |
    +------------------+-----------------------------------------------+

    >>> INSÉRER ICI : Figure 5 — Diagramme des cas d'utilisation — Administrateur <<<

--- PAGE 20 ---

IV.2. Diagramme de classes

    Le diagramme de classes modélise la structure de la base de données MySQL de SIRA GO. 
Il comprend onze entités principales et leurs relations.

    >>> INSÉRER ICI : Figure 6 — Diagramme de classes de la base de données SiraGo <<<

    Description des classes :

    • users : Contient les informations de tous les utilisateurs. Attributs principaux : id, 
      full_name, phone, email, password_hash, role (PASSENGER/DRIVER/ADMIN), 
      sos_real_code_hash, sos_fake_code_hash, is_verified.

    • drivers : Informations complémentaires propres aux chauffeurs. Attributs : user_id (clé 
      étrangère vers users), license_url, id_card_url, registration_card_url, 
      criminal_record_url, vehicle_model, license_plate, verification_status.

    • rides : Représente les courses avec leur cycle de vie. Attributs : id, passenger_id, 
      driver_id, pickup_lat/lng, destination_lat/lng, status (REQUESTED, ACCEPTED, 
      ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED), final_price, 
      commission_amount, driver_net_income.

    • alerts : Stocke les alertes de sécurité. Attributs : id, user_id, ride_id, type (SOS, 
      DEVIATION, CODE_FAUX), status (OPEN, RESOLVED), message, latitude, longitude.

    • trusted_contacts : Contacts de confiance enregistrés par les utilisateurs. Attributs : id, 
      user_id, name, phone.

    • pois : Points d'Intérêt certifiés. Attributs : id, name, category (pharmacy, police, 
      school, commercial), latitude, longitude, address.

    • ride_tracking : Historique des positions GPS. Attributs : id, ride_id, latitude, longitude, 
      source (APP_DATA, SMS_FALLBACK), recorded_at.

--- PAGE 21 ---

    • security_verifications : Journal des vérifications de codes SOS. Attributs : id, ride_id, 
      user_id, role, status (SAFE, DANGER), verified_at.

    • settings : Paramètres de configuration du système. Attributs : id, key, value, 
      description.

    • global_settings : Paramètres globaux de l'interface d'administration.

    • deposits : Enregistrement des dépôts financiers des chauffeurs.

    Relations principales (cardinalités) :
    • users (1) ← (0..*) rides : un utilisateur peut être associé à plusieurs courses
    • users (1) ← (0..*) alerts : un utilisateur peut avoir plusieurs alertes
    • users (1) ← (0..1) drivers : un utilisateur de type DRIVER a un enregistrement chauffeur
    • users (1) ← (0..*) trusted_contacts : un utilisateur a plusieurs contacts de confiance
    • rides (1) ← (0..*) ride_tracking : une course possède plusieurs points de tracking
    • rides (1) ← (0..*) security_verifications : une course peut avoir plusieurs vérifications
    • rides (0..1) ← (0..1) pois : une course peut référencer un POI pour le Smart Pickup

--- PAGE 22 ---

IV.3. Diagrammes de séquence

    Trois diagrammes de séquence ont été réalisés pour illustrer les scénarios critiques du 
système.

a) Séquence : Déclenchement d'une alerte SOS

    >>> INSÉRER ICI : Figure 7 — Diagramme de séquence — Alerte SOS <<<

    Ce diagramme illustre le déroulement suivant :
    1. Le passager appuie 3 fois rapidement sur le bouton volume
    2. Le securityService.js détecte le pattern et envoie une requête au serveur
    3. Le serveur crée une alerte de type SOS dans la table alerts
    4. Le serveur émet un événement 'alerte_critique' via Socket.io vers la admin_room
    5. Le dashboard affiche l'alerte en temps réel dans la War Room
    6. L'administrateur peut activer l'écoute micro à distance

--- PAGE 23 ---

b) Séquence : Inscription chauffeur avec vérification KYC

    >>> INSÉRER ICI : Figure 8 — Diagramme de séquence — Inscription chauffeur (KYC) <<<

    Ce diagramme illustre le déroulement suivant :
    1. Le chauffeur remplit le formulaire d'inscription avec ses informations personnelles
    2. Le chauffeur sélectionne et upload les 4 documents requis
    3. Le frontend envoie une requête multipart/form-data au authController
    4. Multer traite les fichiers et les sauvegarde dans le dossier uploads/
    5. Le serveur crée l'utilisateur (table users) puis l'entrée chauffeur (table drivers) 
       avec le statut pending_verification
    6. Le chauffeur reçoit un token JWT et accède à l'écran d'attente (DriverPendingScreen)
    7. L'administrateur consulte le dossier sur la page KYC du dashboard
    8. L'administrateur approuve ou rejette → le statut du chauffeur est mis à jour

--- PAGE 24 ---

c) Séquence : Détection de déviation et vérification par code de contrainte

    >>> INSÉRER ICI : Figure 9 — Diagramme de séquence — Détection de déviation <<<

    Ce diagramme illustre le déroulement suivant :
    1. Le trackingService reçoit une position GPS du véhicule
    2. Il calcule la déviation perpendiculaire par rapport au trajet prévu (formule cross-track)
    3. Si la déviation dépasse le seuil (500 mètres) :
       a. Une alerte DEVIATION est créée dans la table alerts
       b. Un événement 'check_in_securite' est envoyé au passager et au chauffeur
    4. Chaque participant saisit son code de sécurité
    5. Le securityController compare les codes aux hashs bcrypt stockés
    6. Si un code de contrainte est détecté :
       a. Le statut DANGER est enregistré dans security_verifications
       b. Une alerte CODE_FAUX est créée
       c. L'administrateur reçoit un événement 'alerte_critique' de niveau URGENT
       d. La réponse HTTP reste neutre (200 OK) pour ne pas alerter l'agresseur
    7. Si les deux réponses sont SAFE, l'alerte est résolue
    8. En cas de conflit (SAFE vs DANGER), la priorité est donnée au signal DANGER
