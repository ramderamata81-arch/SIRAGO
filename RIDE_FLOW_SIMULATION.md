# SiraGO — Flux de course simulé (Passager & Chauffeur)

Documentation du flux complet d'une course simulée entre passager et chauffeur(s), avec visibilité temps réel sur la carte admin.

---

## 1. États de la course (RIDE_STATUS)

| État | Alias | Description |
|------|-------|-------------|
| `REQUESTED` | — | Course créée, en attente de chauffeur(s) |
| `DRIVER_ACCEPTED` | ACCEPTED | Passager a choisi un chauffeur, course assignée |
| `DRIVER_ARRIVING` | GOING_TO_PICKUP | Chauffeur en route vers le point de prise en charge (A → B) |
| `PASSENGER_ONBOARD` | ARRIVED | Chauffeur arrivé au pickup, passager à bord |
| `STARTED` | IN_PROGRESS | Course en cours vers la destination (B → C) |
| `COMPLETED` | — | Course terminée |
| `CANCELLED` | — | Course annulée |

**Fichier de constantes** : `SiraGO-Backend/constants/rideStatus.js`

---

## 2. Flux logique complet

```
1. DEMANDE DE COURSE
   Passager → Point A (pickup) vers Point C (destination)
   ↓
   Backend crée ride (status: REQUESTED)
   ↓
   Socket: NEW_RIDE_REQUEST aux chauffeurs proches
   Admin: NOUVELLE_COURSE_ADMIN

2. NOTIFICATION CHAUFFEURS
   Chaque chauffeur reçoit la demande
   → Accepte → ride_candidates (PROPOSED)
   → Refuse → (ignoré ou REJECTED)

3. SÉLECTION CHAUFFEUR
   Passager reçoit la liste (DRIVER_PROPOSED) des chauffeurs ayant accepté
   ↓
   Passager choisit un chauffeur → API selectDriver
   ↓
   ride status → DRIVER_ACCEPTED, driver_id assigné
   ↓
   Socket: TU_ES_CHOISI au chauffeur, CHAUFFEUR_EN_ROUTE au passager
   Admin: MISE_A_JOUR_COURSE

4. PHASE PRISE EN CHARGE (A → B)
   Chauffeur clique "Aller chercher le passager"
   ↓
   Socket: START_PICKUP → status DRIVER_ARRIVING
   ↓
   Simulation: moveCar() anime la voiture sur la polyline (approach_polyline)
   ↓
   Chaque point: DRIVER_LOCATION_UPDATE → Backend diffuse VEHICLE_POSITION_UPDATE
   ↓
   Passager & Admin: Mise à jour temps réel du marqueur
   ↓
   Arrivée au Point B

5. DÉBUT DE LA COURSE
   Chauffeur clique "Démarrer la course"
   ↓
   Socket: START_TRIP → status STARTED
   ↓
   Simulation: moveCar() anime la voiture sur la polyline (trip_polyline)

6. PHASE TRAJET (B → C)
   Même logique: mouvement fluide visible sur Passager, Chauffeur, Admin

7. FIN DE COURSE
   Chauffeur clique "Terminer"
   ↓
   status → COMPLETED
   Admin: retrait de la liste active
```

---

## 3. Simulation de mouvement

### Moteur (MovementEngine)
- **Fichier** : `SIRAGO1/engines/MovementEngine.js`
- **Méthode** : `setInterval` (800ms par segment)
- **Entrée** : tableau de coordonnées (polyline)
- **Sortie** : callback `(currentPoint, nextPoint, index)` à chaque pas

### Utilisation dans DriverMap
```javascript
// handleStartApproach : route chauffeur → pickup
const activeRoute = await rideService.fetchRoute(origin, dest, rideId);
moveCar(activeRoute);

// handleStartRide : route pickup → destination
const activeRoute = await rideService.fetchRoute(origin, dest, rideId);
moveCar(activeRoute);
```

### Émission position
À chaque pas, `moveCar` émet :
```javascript
SocketManager.emit("DRIVER_LOCATION_UPDATE", {
  rideId, tripId, latitude, longitude, bearing, heading, speed, timestamp
});
```

Le backend relaie vers :
- `ride_{rideId}` → Passager (VEHICLE_POSITION_UPDATE, vehicle_update)
- `admin_room` → Admin (VEHICLE_POSITION_UPDATE)

---

## 4. Boutons par rôle et étape

### Passager (PassengerMap)
| État | Bouton(s) |
|------|-----------|
| IDLE | "Commander une course" |
| REQUESTED/SEARCHING | Liste des chauffeurs proposés → "Choisir" |
| DRIVER_ACCEPTED | Attente (chauffeur en route) |
| DRIVER_ARRIVING | Carte live du chauffeur |
| PASSENGER_ONBOARD | Attente démarrage |
| STARTED | Carte live du trajet |
| COMPLETED | Récapitulatif |

### Chauffeur (DriverMap)
| État | Bouton(s) |
|------|-----------|
| DRIVER_ACCEPTED | "Aller chercher le passager" |
| DRIVER_ARRIVING | — (en simulation) → "Arrivé" |
| PASSENGER_ONBOARD | "Démarrer la course" |
| STARTED | — (en simulation) → "Terminer" |
| COMPLETED | Retour accueil |

---

## 5. Fichiers clés

| Composant | Fichier | Rôle |
|-----------|---------|------|
| Backend états | `SiraGO-Backend/constants/rideStatus.js` | Constantes |
| Backend sockets | `SiraGO-Backend/utils/socketService.js` | DRIVER_LOCATION_UPDATE, relais admin |
| Backend ride | `SiraGO-Backend/controllers/rideController.js` | selectDriver, startApproach, etc. |
| Moteur simulation | `SIRAGO1/engines/MovementEngine.js` | Animation par setInterval |
| Carte chauffeur | `SIRAGO1/screens/DriverMap.js` | moveCar, handleStartApproach, handleStartRide |
| Carte passager | `SIRAGO1/screens/PassengerMap.js` | vehicle_update, ROUTE_DATA |
| Carte admin | `Sira-go-Admin/admin-pro/src/pages/LiveMap.jsx` | VEHICLE_POSITION_UPDATE, MISE_A_JOUR_COURSE |

---

## 6. Tests de simulation

Pour tester le flux complet sans GPS réel :
1. Créer une course (Passager) avec pickup et destination
2. Connecter au moins un chauffeur
3. Chauffeur accepte → Passager choisit ce chauffeur
4. Chauffeur clique "Aller chercher" → la voiture se déplace vers le pickup
5. Chauffeur clique "Arrivé" puis "Démarrer la course" → la voiture se déplace vers la destination
6. Admin : ouvrir LiveMap pour voir le suivi en temps réel
