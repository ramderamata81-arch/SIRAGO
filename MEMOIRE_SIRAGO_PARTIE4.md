
============================================================================
         CHAPITRE VI : RÉALISATION ET TESTS
============================================================================

--- PAGE 30 ---

VI. Présentation des modules développés

    Ce chapitre détaille l'implémentation technique des principaux modules de SIRA GO. 
Pour chaque module, nous présentons sa fonction dans l'architecture globale, les choix de 
conception effectués et les extraits de code significatifs illustrant le fonctionnement interne.

--- PAGE 31 ---

VI.1. Authentification et gestion des comptes

    Le module d'authentification (authController.js) prend en charge l'inscription des 
passagers et des chauffeurs, la connexion et la génération de tokens JWT.

    L'inscription du chauffeur est plus complexe que celle du passager car elle inclut 
l'upload de quatre documents via le middleware Multer et la création d'enregistrements 
dans deux tables distinctes (users et drivers).

    >>> INSÉRER ICI : Figure 12 — Écran d'inscription chauffeur avec upload de documents <<<

    Extrait de code — Inscription passager :

    ```javascript
    exports.inscriptionPassager = async (requete, reponse) => {
        const { nomComplet, telephone, email, motDePasse, 
                sosRealCode, sosFakeCode } = requete.body;
        // Vérification d'unicité du numéro
        const [existant] = await baseDeDonnees.query(
            'SELECT id FROM users WHERE phone = ?', [telephone]
        );
        if (existant.length > 0) {
            return reponse.status(409).json({ 
                message: 'Ce numéro est déjà enregistré.' 
            });
        }
        // Hachage sécurisé des données sensibles
        const hashMdp = await bcrypt.hash(motDePasse, 10);
        const hashVrai = sosRealCode ? 
            await bcrypt.hash(sosRealCode, 10) : null;
        const hashFaux = sosFakeCode ? 
            await bcrypt.hash(sosFakeCode, 10) : null;
        // Insertion et génération du token
        const [resultat] = await baseDeDonnees.query(
            `INSERT INTO users (full_name, phone, email, password_hash, 
             role, sos_real_code_hash, sos_fake_code_hash) 
             VALUES (?, ?, ?, ?, 'PASSENGER', ?, ?)`,
            [nomComplet, telephone, email, hashMdp, hashVrai, hashFaux]
        );
        const token = jwt.sign(
            { id: resultat.insertId, role: 'PASSENGER' },
            process.env.JWT_SECRET, { expiresIn: '30d' }
        );
        reponse.status(201).json({ token, utilisateur: { ... } });
    };
    ```

    Points techniques :
    • Les codes SOS (réel et contrainte) sont hachés indépendamment avec bcryptjs
    • Le token JWT encode l'identifiant et le rôle, avec une validité de 30 jours
    • Le rôle est directement intégré au token pour le contrôle d'accès RBAC

--- PAGE 32 ---

VI.2. Marketplace et cycle de vie des courses

    Le Marketplace est le mécanisme central de mise en relation. Il se distingue des modèles 
concurrents (Uber, Yango) en laissant au passager le choix final du chauffeur.

    Le cycle de vie d'une course traverse six états :

    REQUESTED → ACCEPTED → ARRIVED → IN_PROGRESS → COMPLETED
                                                    ↘ CANCELLED

    Extrait de code — Création d'une course et notification temps réel :

    ```javascript
    exports.demanderCourse = async (requete, reponse) => {
        const { passengerId, pickupLat, pickupLng, destinationLat, 
                destinationLng, destinationAddress, poiId } = requete.body;
        const [resultat] = await baseDeDonnees.query(
            `INSERT INTO rides (passenger_id, pickup_lat, pickup_lng, 
             destination_lat, destination_lng, destination_address, 
             poi_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'REQUESTED')`,
            [passengerId, pickupLat, pickupLng, destinationLat, 
             destinationLng, destinationAddress, poiId]
        );
        // Diffusion aux chauffeurs connectés via Socket.io
        const io = obtenirIO();
        io.emit('NOUVELLE_COURSE', {
            idCourse: resultat.insertId,
            passengerId, pickupLat, pickupLng, 
            destinationLat, destinationLng
        });
        reponse.status(201).json({ idCourse: resultat.insertId });
    };
    ```

    Lors de la finalisation, le système calcule automatiquement la commission de la 
plateforme :

    ```javascript
    exports.terminerCourse = async (requete, reponse) => {
        const { prixFinal } = requete.body;
        const [settings] = await baseDeDonnees.query(
            'SELECT value FROM settings WHERE `key` = ?', 
            ['commission_rate']
        );
        const taux = settings.length > 0 ? 
            parseFloat(settings[0].value) : 0.15;
        const commission = prixFinal * taux;
        const revenuNet = prixFinal - commission;
        await baseDeDonnees.query(
            `UPDATE rides SET status='COMPLETED', final_price=?, 
             commission_amount=?, driver_net_income=?, 
             completed_at=NOW() WHERE id=?`,
            [prixFinal, commission, revenuNet, requete.params.id]
        );
    };
    ```

--- PAGE 33 ---

VI.3. Tracking GPS et détection de déviation

    Le module trackingService.js constitue le composant le plus critique du système. Il 
assure trois fonctions : l'enregistrement des positions, la diffusion en temps réel et la 
détection automatique des écarts de trajectoire.

    >>> INSÉRER ICI : Figure 13 — Interface de suivi de course en temps réel <<<

    La détection de déviation s'appuie sur deux fonctions mathématiques :

    a) La formule de Haversine pour le calcul de distance entre deux coordonnées GPS :

    ```javascript
    function calculerDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Rayon terrestre en mètres
        const f1 = lat1 * Math.PI / 180;
        const f2 = lat2 * Math.PI / 180;
        const df = (lat2 - lat1) * Math.PI / 180;
        const dl = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(df/2) * Math.sin(df/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(dl/2) * Math.sin(dl/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    ```

    b) La distance cross-track pour mesurer l'écart perpendiculaire par rapport à l'itinéraire :

    ```javascript
    function calculerDeviationPerpendiculaire(
        latA, lonA, latB, lonB, latP, lonP) {
        // A = départ, B = destination, P = position actuelle
        const R = 6371e3;
        const distAP = calculerDistance(latA, lonA, latP, lonP) / R;
        const brngAP = /* bearing de A vers P */;
        const brngAB = /* bearing de A vers B */;
        const deviation = Math.asin(
            Math.sin(distAP) * Math.sin(brngAP - brngAB)
        ) * R;
        return Math.abs(deviation);
    }
    ```

    Lorsque l'écart dépasse 500 mètres, le système déclenche un protocole de vérification :
    il crée une alerte DEVIATION, envoie un check-in aux deux participants via Socket.io et 
    notifie l'administrateur dans la War Room.

--- PAGE 34 ---

VI.4. Sécurité : SOS matériel et code de contrainte

    Le securityController.js gère la vérification des codes de sécurité. Lorsqu'un check-in 
est déclenché, chaque participant saisit son code personnel. Le serveur compare la saisie 
aux deux hashs stockés en base (code réel et code de contrainte) via bcrypt.compare().

    ```javascript
    exports.verifierCodeSecurite = async (requete, reponse) => {
        const { idUtilisateur, code, idCourse } = requete.body;
        const [utilisateurs] = await baseDeDonnees.query(
            'SELECT sos_real_code_hash, sos_fake_code_hash 
             FROM users WHERE id = ?', [idUtilisateur]
        );
        const user = utilisateurs[0];
        const estFaux = await bcrypt.compare(
            code, user.sos_fake_code_hash
        );
        const statut = estFaux ? 'DANGER' : 'SAFE';
        // Journalisation
        await baseDeDonnees.query(
            'INSERT INTO security_verifications 
             (ride_id, user_id, role, status) VALUES (?, ?, ?, ?)',
            [idCourse, idUtilisateur, role, statut]
        );
        if (statut === 'DANGER') {
            // Alerte silencieuse vers l'admin
            io.to('admin_room').emit('alerte_critique', {
                type: 'DANGER_CONFIRME', idCourse,
                message: 'Danger immédiat signalé', niveau: 'URGENT'
            });
        }
        // Réponse TOUJOURS neutre (furtivité)
        return reponse.status(200).json({ status: 'OK' });
    };
    ```

    Point fondamental : la réponse HTTP est identique quel que soit le code saisi (200 OK). 
    Un agresseur observant l'écran ne peut pas distinguer si le code de contrainte a été utilisé. 
    L'alerte est traitée exclusivement côté serveur et dashboard administrateur.

    Côté mobile, le module securityService.js intercepte les appuis rapides sur les touches 
de volume pour déclencher un SOS matériel sans interaction avec l'écran.

--- PAGE 35 ---

VI.5. Résilience réseau : basculement SMS

    Le resilienceController.js implémente un webhook HTTP capable de recevoir les 
coordonnées GPS transmises par SMS lorsque le réseau data est indisponible.

    >>> INSÉRER ICI : Figure 14 — Simulation du basculement en mode SMS <<<

    ```javascript
    exports.webhookSmsResilience = async (requete, reponse) => {
        const { Body, From } = requete.body;
        // Parsing du format structuré
        const matchLat = Body.match(/LAT:([-+]?[\d.]+)/);
        const matchLng = Body.match(/LNG:([-+]?[\d.]+)/);
        const matchRide = Body.match(/RIDE:(\d+)/);
        if (matchLat && matchLng && matchRide) {
            const lat = parseFloat(matchLat[1]);
            const lng = parseFloat(matchLng[1]);
            const rideId = parseInt(matchRide[1]);
            // Injection dans le pipeline de tracking
            await enregistrerPositionService(
                rideId, lat, lng, 'SMS_FALLBACK'
            );
            return reponse.status(200).send('OK');
        }
        reponse.status(400).send('Format invalide');
    };
    ```

    Le format du message est standardisé : LAT:5.3200 LNG:-3.9800 RIDE:42. Ce format 
    compact minimise la taille du SMS tout en restant analysable par expression régulière.

    La colonne source de la table ride_tracking permet de distinguer l'origine des données : 
    'APP_DATA' pour les positions transmises via Internet et 'SMS_FALLBACK' pour celles 
    issues du réseau SMS.

--- PAGE 36 ---

VI.6. Administration et validation KYC

    L'adminController.js fournit les endpoints nécessaires à la gestion centralisée de la 
plateforme. Le processus KYC (Know Your Customer) suit un workflow précis :

    1. Le chauffeur soumet son dossier lors de l'inscription
    2. Son statut passe automatiquement à pending_verification
    3. L'administrateur consulte les documents sur la page KYC du dashboard
    4. Il approuve ou rejette le dossier avec une annotation
    5. Si approuvé : le statut passe à approved et is_verified à 1
    6. Le chauffeur peut alors signer le contrat numérique et opérer

    >>> INSÉRER ICI : Figure 15 — Dashboard administrateur — War Room <<<

    L'écoute micro à distance permet à l'administrateur, en cas d'alerte critique, d'activer 
discrètement le microphone du terminal ciblé via l'événement Socket.io 'force_mic_on'. 
L'application mobile capte cet événement et démarre un enregistrement audio en arrière-plan 
via expo-audio, sans interface visible à l'écran.

--- PAGE 37 ---

VI.7. Résultats des tests

    >>> INSÉRER ICI : Tableau 10 — Résultats des tests fonctionnels <<<

    +------+-------------------------------+-----------------------------+--------+
    | Réf  | Scénario                      | Comportement attendu        | Résul. |
    +------+-------------------------------+-----------------------------+--------+
    | T01  | Inscription passager avec     | Compte créé, codes hachés,  | OK     |
    |      | codes SOS                     | token JWT retourné          |        |
    +------+-------------------------------+-----------------------------+--------+
    | T02  | Connexion par téléphone       | Token JWT valide généré     | OK     |
    +------+-------------------------------+-----------------------------+--------+
    | T03  | Demande de course             | Course créée, notification  | OK     |
    |      |                               | Socket.io diffusée          |        |
    +------+-------------------------------+-----------------------------+--------+
    | T04  | Acceptation par chauffeur     | Statut → ACCEPTED           | OK     |
    +------+-------------------------------+-----------------------------+--------+
    | T05  | Tracking GPS en temps réel    | Position mise à jour via    | OK     |
    |      |                               | Socket.io toutes les 3s     |        |
    +------+-------------------------------+-----------------------------+--------+
    | T06  | Déviation > 500m              | Alerte DEVIATION, check-in  | OK     |
    |      |                               | envoyé aux participants     |        |
    +------+-------------------------------+-----------------------------+--------+
    | T07  | Saisie du code de contrainte  | Alerte CODE_FAUX, réponse   | OK     |
    |      |                               | neutre (200 OK)             |        |
    +------+-------------------------------+-----------------------------+--------+
    | T08  | Conflit SAFE vs DANGER        | Priorité au signal DANGER   | OK     |
    +------+-------------------------------+-----------------------------+--------+
    | T09  | Activation micro admin        | Événement reçu par le      | OK     |
    |      |                               | terminal ciblé              |        |
    +------+-------------------------------+-----------------------------+--------+
    | T10  | Validation KYC chauffeur      | Statut → approved,          | OK     |
    |      |                               | is_verified → 1             |        |
    +------+-------------------------------+-----------------------------+--------+

    >>> INSÉRER ICI : Tableau 11 — Résultats des tests de résilience réseau <<<

    +------+-------------------------------+-----------------------------+--------+
    | Réf  | Scénario                      | Comportement attendu        | Résul. |
    +------+-------------------------------+-----------------------------+--------+
    | R01  | Connexion Internet stable     | Tracking via APP_DATA       | OK     |
    +------+-------------------------------+-----------------------------+--------+
    | R02  | Perte de connexion data       | Basculement sur envoi SMS   | OK     |
    +------+-------------------------------+-----------------------------+--------+
    | R03  | Retour de la connexion        | Reprise du tracking via     | OK     |
    |      |                               | APP_DATA                    |        |
    +------+-------------------------------+-----------------------------+--------+
    | R04  | Réception SMS par webhook     | Parsing et insertion avec   | OK     |
    |      |                               | source = SMS_FALLBACK       |        |
    +------+-------------------------------+-----------------------------+--------+
    | R05  | SMS au format non conforme    | Rejet (erreur 400)          | OK     |
    +------+-------------------------------+-----------------------------+--------+

    L'ensemble des scénarios de test a été validé avec succès, confirmant le bon 
fonctionnement des fonctionnalités développées.
