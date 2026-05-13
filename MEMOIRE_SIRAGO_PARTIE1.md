
                                        DÉDICACE

Louange à Allah Azza wa Jal, le Tout-Puissant, le Clément et le Miséricordieux, sans qui 
rien n'aurait été possible. Qu'Il guide mes pas et illumine mon chemin.

À la mémoire de mes parents, partis trop tôt. Que Dieu les accueille dans Son infinie miséricorde 
et leur accorde le plus haut degré du Paradis. Votre amour, vos enseignements et votre 
bienveillance restent à jamais gravés en moi.

À mon oncle maternel, qui a été un véritable pilier dans mon parcours académique. Par son 
soutien inconditionnel, ses sacrifices et son engagement, il a rendu possible chaque étape de mes 
études. Que Dieu lui accorde une longue vie remplie de bénédictions et de récompenses pour tout 
ce qu'il a fait pour moi.

Sans oublier tous mes professeurs et camarades, qui, au cours de ces trois années d'études, ont su 
m'aider en temps voulu. Votre soutien, vos conseils et votre présence ont été d'une grande valeur 
dans ce parcours.

--- PAGE II ---



                                    REMERCIEMENTS

De prime abord, nous tenons à exprimer notre profonde gratitude envers Allah Azza wa 
Jal, le Tout-Puissant, qui nous a accordé la force, la santé et la vigueur nécessaires pour mener à 
bien ce projet. C'est grâce à Sa bienveillance infinie que nous avons pu surmonter les défis 
rencontrés et atteindre cet objectif. Que toute la gloire Lui revienne et que nous soyons toujours 
guidés par Sa lumière.

En second lieu, il nous est d'une grande importance de remercier l'Institut Universitaire 
d'Abidjan qui est l'établissement où nous avons acquis la majeure partie des compétences qui 
nous permettront d'être des acteurs compétitifs sur le marché du travail.

L'aboutissement de ce projet a vu la contribution de plusieurs personnes. Nous désirons 
remercier tous ceux qui y ont pris part à travers ces quelques lignes :

- DOCTEUR KANGA Koffi, Chef du département Informatique, qui a été mon encadreur 
  pour l'élaboration de cette étude.
- PROFESSEUR PETEY Oliver qui a été une aide grâce à ses précieux conseils.
- PROFESSEUR KANDA qui a établi une proximité saine et professionnelle avec les 
  étudiants du département.
- DOCTEUR ATTA qui a su nous aider et nous épauler pendant les périodes de difficultés 
  face à la pression universitaire.

Nous tenons à remercier de plus nos confrères et aînés avec qui nous avons évolué dans cette 
filière. Un immense merci à toute notre famille pour le soutien apporté et le suivi.

Pour finir, nos vifs remerciements à tous les professeurs appartenant un tant soit peu au 
département Informatique qui nous a guidé vers la connaissance, la maîtrise et l'expertise de ce 
que nous avons appris.

--- PAGE III ---



                                        RÉSUMÉ

Le présent mémoire s'inscrit dans le cadre de l'obtention du diplôme de Licence en Génie 
Informatique (GI) à l'Institut Universitaire d'Abidjan (IUA).

Il constitue l'aboutissement de trois années de formation au cours desquelles nous avons acquis 
des compétences solides en développement logiciel, en architecture des systèmes d'information 
et en ingénierie des réseaux.

Notre projet, intitulé SIRA GO, est une application mobile de transport VTC (Véhicule de 
Transport avec Chauffeur) dotée d'un suivi GPS en temps réel. Elle se distingue des solutions 
existantes par trois piliers technologiques :

• Un système de résilience hybride Internet/SMS qui maintient le tracking GPS même en 
  absence de connexion data, grâce à un basculement automatique sur le réseau SMS
• Un dispositif de sécurité proactive comprenant un déclenchement SOS via les touches 
  physiques du téléphone et un mécanisme de code de contrainte à réponse furtive
• Un modèle Marketplace qui offre au passager la liberté de choisir son chauffeur parmi 
  plusieurs offres, avec transparence sur les prix et les notes

La pile technologique repose sur React Native / Expo (mobile), Node.js / Express (serveur), 
Socket.io (temps réel), MySQL (base de données) et React.js (dashboard administrateur). La 
modélisation a été réalisée avec le langage UML.

--- PAGE IV ---



                                        SOMMAIRE

DÉDICACE ......................................................................................... II
REMERCIEMENTS .......................................................................... III
RÉSUMÉ ............................................................................................... IV
SOMMAIRE ......................................................................................... V
LISTE DES FIGURES ET TABLEAUX ............................................ VI

INTRODUCTION GÉNÉRALE ............................................................ 1

PREMIÈRE PARTIE : CADRE CONTEXTUEL ET PROBLÉMATIQUE

CHAPITRE I : PRÉSENTATION DU CADRE D'ÉTUDE ................... 3
I. Le transport urbain en Côte d'Ivoire ................................................... 3
I.1. Les défis du terrain : connectivité et sécurité ................................... 4
I.2. Les enjeux d'une solution résiliente ................................................. 5

CHAPITRE II : ÉTUDE COMPARATIVE DES SOLUTIONS ........... 7
II. Panorama des plateformes VTC existantes .......................................... 7
II.1. Analyse des faiblesses identifiées .................................................... 8
II.2. Positionnement de SiraGo ............................................................... 9

DEUXIÈME PARTIE : CONCEPTION DU SYSTÈME

CHAPITRE III : SPÉCIFICATION DES BESOINS ............................. 11
III. Identification des acteurs et de leurs attentes ..................................... 11
III.1. Besoins du profil Passager .............................................................. 12
III.2. Besoins du profil Chauffeur ............................................................ 13
III.3. Besoins du profil Administrateur .................................................... 14
III.4. Contraintes non-fonctionnelles ....................................................... 15

CHAPITRE IV : MODÉLISATION AVEC UML ................................. 17
IV. Approche de conception orientée objet ............................................... 17
IV.1. Diagrammes des cas d'utilisation .................................................... 18
IV.2. Diagramme de classes ..................................................................... 20
IV.3. Diagrammes de séquence ................................................................ 22

TROISIÈME PARTIE : RÉALISATION ET RÉSULTATS

CHAPITRE V : ENVIRONNEMENT TECHNIQUE ........................... 25
V. Présentation des outils et technologies ................................................ 25
V.1. Application mobile : React Native et Expo ...................................... 26
V.2. Serveur applicatif : Node.js, Express et Socket.io ........................... 27
V.3. Stockage des données : MySQL ....................................................... 28
V.4. Interface d'administration : React.js ................................................ 29

CHAPITRE VI : RÉALISATION ET TESTS ....................................... 30
VI. Présentation des modules développés ................................................. 30
VI.1. Authentification et gestion des comptes ......................................... 31
VI.2. Marketplace et cycle de vie des courses ......................................... 32
VI.3. Tracking GPS et détection de déviation ......................................... 33
VI.4. Sécurité : SOS matériel et code de contrainte ................................ 34
VI.5. Résilience réseau : basculement SMS ............................................. 35
VI.6. Administration et validation KYC .................................................. 36
VI.7. Résultats des tests .......................................................................... 37

CONCLUSION GÉNÉRALE ............................................................... 38
ANNEXES ............................................................................................. 39
GLOSSAIRE ........................................................................................ 41
BIBLIOGRAPHIE / WEBOGRAPHIE ................................................ 42

--- PAGE V ---



                              LISTE DES FIGURES

Figure 1 : Architecture globale de la plateforme SiraGo ............................. 5
Figure 2 : Écran d'accueil passager avec le Marketplace ............................. 9
Figure 3 : Diagramme des cas d'utilisation — Passager ............................... 18
Figure 4 : Diagramme des cas d'utilisation — Chauffeur ............................ 19
Figure 5 : Diagramme des cas d'utilisation — Administrateur .................... 19
Figure 6 : Diagramme de classes de la base de données SiraGo .................. 20
Figure 7 : Diagramme de séquence — Alerte SOS ...................................... 22
Figure 8 : Diagramme de séquence — Inscription chauffeur (KYC) ........... 23
Figure 9 : Diagramme de séquence — Détection de déviation .................... 24
Figure 10 : Architecture technique React Native / Expo .............................. 26
Figure 11 : Flux de communication Socket.io .............................................. 27
Figure 12 : Écran d'inscription chauffeur avec upload de documents ......... 31
Figure 13 : Interface de suivi de course en temps réel ................................. 33
Figure 14 : Simulation du basculement en mode SMS ................................. 35
Figure 15 : Dashboard administrateur — War Room .................................. 36

--- PAGE VI ---



                              LISTE DES TABLEAUX

Tableau 1 : Comparaison des plateformes VTC existantes ........................... 8
Tableau 2 : Besoins fonctionnels du profil Passager ...................................... 12
Tableau 3 : Besoins fonctionnels du profil Chauffeur .................................... 13
Tableau 4 : Besoins fonctionnels du profil Administrateur ........................... 14
Tableau 5 : Contraintes non-fonctionnelles du système ................................ 15
Tableau 6 : Environnement matériel et logiciel de développement ............... 25
Tableau 7 : Bibliothèques principales du frontend mobile ........................... 26
Tableau 8 : Dépendances du serveur backend .............................................. 27
Tableau 9 : Structure de la table users dans MySQL .................................... 28
Tableau 10 : Résultats des tests fonctionnels ................................................ 37
Tableau 11 : Résultats des tests de résilience réseau .................................... 37

--- PAGE VII ---



============================================================================
                          INTRODUCTION GÉNÉRALE
============================================================================

--- PAGE 1 ---

    La mobilité urbaine occupe aujourd'hui une place centrale dans le quotidien des populations 
africaines. À Abidjan, capitale économique de la Côte d'Ivoire, les déplacements de plusieurs 
millions de personnes chaque jour posent un triple défi : celui de l'efficacité du service, celui de 
la fiabilité technologique et celui de la sûreté des usagers. Si l'émergence des applications de 
VTC (Véhicule de Transport avec Chauffeur) a considérablement modernisé le secteur, force est 
de constater que ces solutions restent tributaires d'une infrastructure réseau souvent instable et 
ne disposent pas de mécanismes de protection adaptés aux situations d'urgence réelles.

    C'est à partir de ce constat que nous avons entrepris la conception et le développement de 
SIRA GO, une plateforme mobile de gestion de transport avec suivi en temps réel. Ce projet, 
issu de la thématique « Logiciel de gestion de transport ou de livraison avec suivi en temps 
réel », propose une approche inédite articulée autour de trois axes : la résilience du système face 
aux coupures de réseau, la sécurité proactive des passagers et des chauffeurs, et la transparence 
dans la mise en relation des deux parties grâce à un système de Marketplace ouvert.

    L'originalité de SIRA GO repose sur sa capacité à maintenir un suivi GPS continu même 
lorsque la connexion Internet est indisponible, par le biais d'un protocole de basculement 
automatique sur le réseau SMS. En parallèle, l'application embarque un dispositif d'alerte 
silencieuse activable par les touches physiques du téléphone ainsi qu'un système de code de 
contrainte permettant de signaler un danger sans attirer l'attention d'un éventuel agresseur.

    Ce mémoire, élaboré dans le cadre de l'obtention du diplôme de Licence en Génie 
Informatique à l'Institut Universitaire d'Abidjan (IUA), retrace l'ensemble du processus de 
réalisation de ce projet. Il se structure en trois grandes parties :

• La première partie expose le cadre contextuel de notre étude en analysant les enjeux du 
  transport urbain à Abidjan et en dressant un état des lieux des solutions numériques 
  existantes sur le marché ;

• La deuxième partie détaille la phase de conception, incluant la spécification des besoins 
  fonctionnels et non-fonctionnels ainsi que la modélisation du système à l'aide du langage 
  UML ;

• La troisième partie présente la réalisation technique du projet, les choix d'outils et de 
  technologies effectués, les modules développés et les résultats des tests de validation.

--- PAGE 2 ---



============================================================================
           PREMIÈRE PARTIE : CADRE CONTEXTUEL ET PROBLÉMATIQUE
============================================================================



============================================================================
         CHAPITRE I : PRÉSENTATION DU CADRE D'ÉTUDE
============================================================================

--- PAGE 3 ---

I. Le transport urbain en Côte d'Ivoire

    Abidjan concentre à elle seule plus de 6 millions d'habitants et génère environ 60% du 
produit intérieur brut national. Cette densité démographique et économique engendre un besoin 
massif de déplacements quotidiens. Les moyens de transport classiques — autobus de la SOTRA, 
minibus « gbaka », taxis communaux « woro-woro » — coexistent désormais avec les services 
de transport à la demande accessibles via smartphone.

    L'Autorité de Régulation des Télécommunications de Côte d'Ivoire (ARTCI) rapporte un 
taux de pénétration mobile supérieur à 130%, ce qui traduit un accès massif aux terminaux 
connectés. Toutefois, cette connectivité apparente masque des disparités importantes : de 
nombreuses zones urbaines et péri-urbaines souffrent d'une couverture data instable ou 
insuffisante. Les quartiers de Yopougon, Abobo, Anyama ou encore les axes reliant les communes 
éloignées du centre connaissent régulièrement des coupures réseau rendant les applications 
conventionnelles temporairement inutilisables.

    Par ailleurs, la question sécuritaire dans les transports urbains reste préoccupante. Les 
incidents liés aux agressions, aux détournements de trajet et aux conflits entre usagers et 
conducteurs témoignent d'un besoin réel de dispositifs de protection efficaces et accessibles. 
Or, les plateformes de VTC déployées localement reposent sur des modèles conçus pour des 
marchés où l'infrastructure réseau est stable et les services d'urgence sont facilement joignables, 
ce qui n'est pas toujours le cas dans le contexte ivoirien.

--- PAGE 4 ---

I.1. Les défis du terrain

    Notre analyse du secteur met en lumière trois problèmes structurels auxquels les solutions 
de transport numérique sont confrontées :

a) La fragilité de la connectivité

    Lorsqu'un véhicule traverse une zone à faible couverture réseau, l'application perd la 
capacité de transmettre sa position au serveur. Le suivi GPS s'interrompt et ni le passager, ni la 
plateforme, ni les proches ne peuvent localiser le véhicule. Cette interruption crée un angle mort 
sécuritaire d'autant plus critique qu'elle survient généralement dans des zones isolées.

b) Les limites des dispositifs d'alerte

    Les boutons SOS intégrés aux applications existantes nécessitent systématiquement de 
déverrouiller l'écran du téléphone, d'ouvrir l'application et de naviguer jusqu'au service 
d'urgence. En cas d'agression ou de menace physique, ces manipulations sont irréalistes. Il 
manque un mécanisme d'alerte exploitable sans aucune interaction visuelle avec le terminal.

c) L'imprécision des points de rencontre

    En l'absence d'un système d'adressage postal généralisé, la localisation du passager repose 
entièrement sur la précision du signal GPS, variable selon l'environnement urbain. Les chauffeurs 
consacrent un temps considérable à identifier le point exact de prise en charge, ce qui dégrade 
l'expérience utilisateur et provoque des annulations.

--- PAGE 5 ---

I.2. Les enjeux auxquels SIRA GO répond

    Face à ces constats, SIRA GO a été conçu pour apporter des réponses concrètes :

• Assurer la continuité du service en toute circonstance grâce à un double canal de 
  communication (Internet et SMS). Lorsque la connexion data est perdue, le téléphone 
  transmet automatiquement les coordonnées GPS par message texte vers un serveur de 
  résilience qui les intègre au même système de suivi.

• Offrir un dispositif d'urgence discret et immédiat. Le déclenchement d'une alerte SOS 
  s'effectue par une combinaison rapide des touches de volume, sans qu'il soit nécessaire de 
  toucher l'écran. En complément, un code de contrainte permet à l'utilisateur de feindre 
  une extinction de l'application tout en transmettant silencieusement une alerte au centre 
  de surveillance.

• Faciliter le point de rencontre à travers des Points d'Intérêt (POI) certifiés — pharmacies, 
  commissariats, enseignes connues — qui servent de repères géolocalisés communs entre 
  le passager et le chauffeur.

• Garantir la transparence tarifaire en laissant le passager sélectionner librement son 
  chauffeur parmi les propositions reçues sur un Marketplace ouvert.

    >>> INSÉRER ICI : Figure 1 — Architecture globale de la plateforme SiraGo <<<

--- PAGE 6 ---



============================================================================
       CHAPITRE II : ÉTUDE COMPARATIVE DES SOLUTIONS
============================================================================

--- PAGE 7 ---

II. Panorama des plateformes VTC existantes

    Le marché ivoirien du transport à la demande est animé par plusieurs opérateurs, tant 
internationaux que locaux. Nous avons étudié les trois principales plateformes actives à Abidjan 
afin d'identifier leurs forces et leurs faiblesses.

a) Yango
    Filiale du groupe russe Yandex, Yango s'est installé en Côte d'Ivoire en 2019. 
L'application propose une interface épurée et des tarifs attractifs. Son algorithme d'attribution 
assigne automatiquement un chauffeur au passager. Le service fonctionne exclusivement via 
Internet et ne dispose d'aucune solution de repli en cas de perte de réseau.

b) Uber
    Présent à Abidjan depuis 2016, Uber offre un écosystème complet incluant l'estimation 
tarifaire, le partage de course et le paiement électronique. Néanmoins, son dispositif d'urgence 
requiert plusieurs manipulations à l'écran et l'application devient inopérante hors couverture 
data.

c) Heetch
    Heetch se distingue par son positionnement axé sur les courses de nuit et par une politique 
de rémunération favorisant les chauffeurs. Cependant, l'application partage les mêmes contraintes 
que ses concurrents en matière de dépendance réseau et d'absence de sécurité matérielle.

--- PAGE 8 ---

II.1. Analyse des faiblesses identifiées

    >>> INSÉRER ICI : Tableau 1 — Comparaison des plateformes VTC existantes <<<

    +---------------------------+---------+---------+---------+-----------+
    | Fonctionnalité            | Yango   | Uber    | Heetch  | SIRA GO   |
    +---------------------------+---------+---------+---------+-----------+
    | Suivi GPS temps réel      |   Oui   |   Oui   |   Oui   |    Oui    |
    | Fonctionnement offline    |   Non   |   Non   |   Non   |    Oui    |
    | Basculement SMS           |   Non   |   Non   |   Non   |    Oui    |
    | Alerte SOS matérielle     |   Non   |   Non   |   Non   |    Oui    |
    | Code de contrainte        |   Non   |   Non   |   Non   |    Oui    |
    | Détection de déviation    |   Non   |  Partiel|   Non   |    Oui    |
    | Points d'intérêt certifiés|   Non   |   Non   |   Non   |    Oui    |
    | Écoute micro à distance   |   Non   |   Non   |   Non   |    Oui    |
    | Choix libre du chauffeur  |   Non   |   Non   |   Non   |    Oui    |
    | Contrat chauffeur intégré |   Non   |   Oui   |   Non   |    Oui    |
    +---------------------------+---------+---------+---------+-----------+

    L'ensemble de ces plateformes partage un socle commun de limitations :

    - Elles cessent tout tracking dès la perte du signal Internet ;
    - Leurs mécanismes d'alerte nécessitent une manipulation active de l'écran ;
    - Aucune ne propose de vérification discrète de la sécurité des participants ;
    - Le point de rencontre repose uniquement sur le GPS, sans repère physique alternatif.

--- PAGE 9 ---

II.2. Positionnement de SIRA GO

    SIRA GO n'a pas vocation à concurrencer ces plateformes sur leur terrain commercial. 
Notre projet se positionne comme une contribution technologique centrée sur deux axes que 
les solutions actuelles ne couvrent pas : la résilience face aux aléas réseau et la protection 
proactive des usagers.

    Les cinq apports distinctifs de notre solution sont :

    1. La résilience hybride : le système bascule de manière transparente entre la connexion 
       Internet et le protocole SMS pour assurer un suivi GPS ininterrompu.

    2. L'alerte matérielle : le déclenchement SOS par les touches de volume permet d'appeler 
       à l'aide sans interaction avec l'interface graphique de l'application.

    3. Le code de contrainte : sous la menace, un code spécifique déclenche une fausse 
       extinction de l'application tout en transmettant une alerte silencieuse au serveur.

    4. Le Smart Pickup : les POI certifiés offrent des points de rendez-vous fiables et connus, 
       réduisant significativement le temps de prise en charge.

    5. Le Marketplace ouvert : le passager consulte les offres de plusieurs chauffeurs et choisit 
       en toute connaissance de cause (prix, note, temps d'arrivée estimé).

    >>> INSÉRER ICI : Figure 2 — Écran d'accueil passager avec le Marketplace <<<

--- PAGE 10 ---

