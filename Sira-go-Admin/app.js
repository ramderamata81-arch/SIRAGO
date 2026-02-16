
// =============================================
// LOGIQUE SALLE DE CRISE - CENTRE DE GESTION SIRA GO
// =============================================

/**
 * Données Globales de la Salle de Crise
 */
const LISTE_ALERTES = [];
const ETATS_MICROS = {}; // { "chauffeurId_role": boolean }
const TEMPS_ENREGISTREMENT = {}; // { "chauffeurId_role": Date }
let vehiculeSelectionneId = null;

/**
 * Algorithme "Snap-to-Road" (Simulation)
 */
function collerALaRoute(point, itineraire) {
    if (!itineraire || itineraire.length < 2) return point;

    let distanceMin = Infinity;
    let pointColle = point;

    for (let i = 0; i < itineraire.length - 1; i++) {
        const debut = itineraire[i];
        const fin = itineraire[i + 1];
        const plusProche = obtenirPointLePlusProcheSegment(point[0], point[1], debut[0], debut[1], fin[0], fin[1]);
        const dist = calculerDistance(point[0], point[1], plusProche[0], plusProche[1]);

        if (dist < distanceMin) {
            distanceMin = dist;
            pointColle = plusProche;
        }
    }
    return pointColle;
}

function obtenirPointLePlusProcheSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx === 0 && dy === 0) return [x1, y1];
    const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    if (t < 0) return [x1, y1];
    if (t > 1) return [x2, y2];
    return [x1 + t * dx, y1 + t * dy];
}

function calculerDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Gestion des Alertes Centralisées
 */
function ajouterAlerte(type, chauffeurId, message, role = 'chauffeur') {
    const chauffeur = typeof DRIVERS !== 'undefined' ? DRIVERS.find(d => d.id === chauffeurId) : null;
    const alerte = {
        id: Date.now(),
        type: type, // 'SOS' ou 'FAUX_CODE'
        chauffeurId: chauffeurId,
        chauffeurNom: chauffeur ? chauffeur.name : 'Inconnu',
        vehiculePlate: chauffeur ? chauffeur.plate : 'vX',
        message: message,
        roleEmmetteur: role,
        timestamp: new Date().toLocaleTimeString('fr-FR')
    };

    LISTE_ALERTES.unshift(alerte);
    rendreAlertes();

    // Notification système
    const titre = type === 'SOS' ? `🚨 ALERTE SOS (${role.toUpperCase()})` : '👤 FAUX CODE DÉTECTÉ';
    showNotification(titre, `${alerte.chauffeurNom} : ${message}`, 'danger');
}

function rendreAlertes() {
    const conteneur = document.getElementById('alertes-container');
    if (!conteneur) return;

    if (LISTE_ALERTES.length === 0) {
        conteneur.innerHTML = '';
        return;
    }

    conteneur.innerHTML = LISTE_ALERTES.map(alerte => {
        const key = `${alerte.chauffeurId}_${alerte.roleEmmetteur}`;
        const estActif = ETATS_MICROS[key] || false;

        return `
        <div class="alerte-item ${alerte.type === 'FAUX_CODE' ? 'faux-code' : ''}" id="alerte-${alerte.id}">
            <h6>
                <i class="fas ${alerte.type === 'SOS' ? 'fa-exclamation-triangle' : 'fa-user-secret'}"></i>
                ${alerte.type === 'SOS' ? 'SOS ACTIF' : 'FAUX CODE'} - ${alerte.timestamp}
            </h6>
            <div class="small text-white-50">
                <strong>${alerte.chauffeurNom}</strong> (${alerte.vehiculePlate})
                <p class="mb-0 mt-1">${alerte.message}</p>
                <div class="mt-1"><span class="badge bg-secondary">Émetteur: ${alerte.roleEmmetteur.toUpperCase()}</span></div>
            </div>
            <div class="actions-alerte">
                <button class="btn btn-sm ${estActif ? 'btn-danger' : 'btn-primary-custom'}" 
                        onclick="basculerEcoutePassiveCible('${alerte.roleEmmetteur}', ${alerte.chauffeurId})">
                    <i class="fas ${estActif ? 'fa-microphone-alt' : 'fa-microphone'} me-1"></i> 
                    Micro ${alerte.roleEmmetteur === 'chauffeur' ? 'Chauf.' : 'Pass.'}
                </button>
                <button class="btn btn-sm btn-outline-light" onclick="supprimerAlerte(${alerte.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `}).join('');
}

function supprimerAlerte(id) {
    const index = LISTE_ALERTES.findIndex(a => a.id === id);
    if (index > -1) {
        LISTE_ALERTES.splice(index, 1);
        rendreAlertes();
    }
}

/**
 * Contrôle Exclusif de l'Écoute Passive (Ciblé par Rôle)
 */
function basculerEcoutePassiveCible(role, chauffeurId) {
    const id = chauffeurId || vehiculeSelectionneId;
    if (!id) {
        showNotification('ℹ️ INFO', 'Veuillez sélectionner un véhicule ou une alerte.', 'info');
        return;
    }

    const key = `${id}_${role}`;
    ETATS_MICROS[key] = !ETATS_MICROS[key];

    const chauffeur = typeof DRIVERS !== 'undefined' ? DRIVERS.find(d => d.id === id) : null;
    const nom = chauffeur ? chauffeur.name : 'Inconnu';

    if (ETATS_MICROS[key]) {
        showNotification('🎤 MICRO ACTIVÉ', `Écoute passive sur terminal ${role.toUpperCase()} (${nom}).`, 'danger');
        TEMPS_ENREGISTREMENT[key] = new Date();
    } else {
        const finEnregistrement = new Date();
        const debut = TEMPS_ENREGISTREMENT[key] || finEnregistrement;
        const dureeSec = Math.floor((finEnregistrement - debut) / 1000);

        sauvegarderEnregistrementAudio(id, role, dureeSec);
        showNotification('✅ ENREGISTREMENT TERMINÉ', `L'audio du ${role} (${nom}) a été archivé.`, 'success');
        delete TEMPS_ENREGISTREMENT[key];
    }

    // Mises à jour UI synchronisées
    rendreAlertes();
    updateVehicleList();
    updateVehicleDetailsPanel();
    mettreAJourMarqueursCarte();
}

/**
 * Gestion du Panneau de Détails Véhicule
 */
function selectVehicle(id) {
    const vehicle = typeof FLEET_DATA !== 'undefined' ? FLEET_DATA.vehicles.find(v => v.id === id) : null;
    if (!vehicle) return;

    vehiculeSelectionneId = vehicle.driverId; // Utilise driverId comme identifiant commun

    const panel = document.getElementById('vehicle-details-panel');
    panel.style.display = 'block';

    updateVehicleDetailsPanel();

    // Centrer la carte sur le véhicule (si map existe)
    if (typeof map !== 'undefined' && map) {
        console.log("Salle de Crise : Focalisation sur véhicule " + vehicle.plate);
    }
}

function updateVehicleDetailsPanel() {
    if (!vehiculeSelectionneId) return;

    const chauffeur = typeof DRIVERS !== 'undefined' ? DRIVERS.find(d => d.id === vehiculeSelectionneId) : null;
    const vehicule = typeof FLEET_DATA !== 'undefined' ? FLEET_DATA.vehicles.find(v => v.driverId === vehiculeSelectionneId) : null;

    if (!chauffeur || !vehicule) return;

    document.getElementById('detail-model').textContent = vehicule.model;
    document.getElementById('detail-plate').textContent = vehicule.plate;
    document.getElementById('detail-driver').textContent = chauffeur.name;

    // État des boutons micros
    const micChauffeurActif = ETATS_MICROS[`${vehiculeSelectionneId}_chauffeur`];
    const micPassagerActif = ETATS_MICROS[`${vehiculeSelectionneId}_passager`];

    const btnChauffeur = document.getElementById('mic-btn-chauffeur');
    const btnPassager = document.getElementById('mic-btn-passager');

    if (micChauffeurActif) btnChauffeur.classList.add('active');
    else btnChauffeur.classList.remove('active');

    if (micPassagerActif) btnPassager.classList.add('active');
    else btnPassager.classList.remove('active');
}

function hideVehicleDetails() {
    vehiculeSelectionneId = null;
    document.getElementById('vehicle-details-panel').style.display = 'none';
}

/**
 * Stockage des Enregistrements Audio (Simulation)
 */
const ARCHIVES_AUDIO = [];

function sauvegarderEnregistrementAudio(chauffeurId, role, duree) {
    const chauffeur = typeof DRIVERS !== 'undefined' ? DRIVERS.find(d => d.id === chauffeurId) : null;
    const enregistrement = {
        id: Date.now(),
        date: new Date().toLocaleString('fr-FR'),
        chauffeur: chauffeur ? chauffeur.name : 'Conducteur Inconnu',
        vehicule: chauffeur ? chauffeur.vehicle : 'Véhicule vX',
        duree: formaterDuree(duree),
        timestamp: new Date().getTime(),
        type: `Écoute ${role.toUpperCase()}`
    };

    ARCHIVES_AUDIO.unshift(enregistrement);
    mettreAJourInterfaceArchives();
}

function formaterDuree(sec) {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function mettreAJourInterfaceArchives() {
    const badge = document.getElementById('records-badge');
    if (badge) badge.textContent = ARCHIVES_AUDIO.length;

    const tableau = document.getElementById('audio-records-table');
    if (!tableau) return;

    if (ARCHIVES_AUDIO.length === 0) {
        tableau.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-secondary"><i class="fas fa-microphone-alt-slash fa-2x mb-3"></i><p>Aucun enregistrement sauvegardé</p></td></tr>`;
        return;
    }

    tableau.innerHTML = ARCHIVES_AUDIO.map(rec => `
        <tr>
            <td>${rec.date}</td>
            <td><div class="fw-bold">${rec.chauffeur}</div><div class="small text-secondary">${rec.vehicule}</div></td>
            <td>${rec.duree}</td>
            <td><span class="badge bg-primary">${rec.type}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="lireEnregistrement(${rec.id})"><i class="fas fa-play"></i></button>
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="supprimerEnregistrement(${rec.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

/**
 * Interface Véhicules Latérale
 */
function updateVehicleList() {
    const conteneur = document.getElementById('vehicle-list');
    if (!conteneur) return;

    const vehiculesEnCourse = typeof FLEET_DATA !== 'undefined' ? FLEET_DATA.vehicles.filter(v => v.status === 'active') : [];

    if (vehiculesEnCourse.length === 0) {
        conteneur.innerHTML = '<div class="text-center py-4 text-secondary"><i class="fas fa-car fa-2x mb-3"></i><p class="mb-0 small">Aucun véhicule en course</p></div>';
        return;
    }

    conteneur.innerHTML = vehiculesEnCourse.map(v => {
        const chauffeur = typeof DRIVERS !== 'undefined' ? DRIVERS.find(d => d.id === v.driverId) : null;
        const micChauffeur = ETATS_MICROS[`${v.driverId}_chauffeur`];
        const micPassager = ETATS_MICROS[`${v.driverId}_passager`];

        return `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary ${vehiculeSelectionneId === v.driverId ? 'bg-primary-subtle rounded-1' : ''}" 
                 onclick="selectVehicle(${v.id})" style="cursor: pointer; transition: 0.2s;">
                <div class="ps-1">
                    <div class="fw-bold" style="font-size: 0.85rem;">${v.model}</div>
                    <div class="small text-secondary">${v.plate}</div>
                </div>
                <div class="d-flex gap-1 pe-1">
                    ${micChauffeur ? '<i class="fas fa-microphone text-danger fa-xs pulse"></i>' : ''}
                    ${micPassager ? '<i class="fas fa-users text-danger fa-xs pulse"></i>' : ''}
                    <button class="btn btn-xs btn-outline-primary p-1"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function basculerOutilsAdmin() {
    const outils = document.getElementById('admin-tools');
    const bascule = document.getElementById('tools-toggle');
    outils.classList.toggle('hidden');
    bascule.classList.toggle('active');
}

function triggerManualSOS() {
    const id = vehiculeSelectionneId || 1;
    ajouterAlerte('SOS', id, 'Alerte SOS déclenchée manuellement par l\'administrateur.', 'admin');
}

function demarrerMoniteurSecousse(chauffeurId = 2) {
    ajouterAlerte('SOS', chauffeurId, 'Secousse violente détectée (Automatique).', 'passager');
}

function declencherAlerteFauxCode(chauffeurId = 1) {
    ajouterAlerte('FAUX_CODE', chauffeurId, 'Le conducteur a été forcé de saisir le code de détresse.', 'chauffeur');
}

function mettreAJourMarqueursCarte() {
    console.log("Salle de Crise : Mise à jour visuelle des marqueurs (Ondes radio).");
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateVehicleList();
    rendreAlertes();
});

// Exports Globaux
window.basculerOutilsAdmin = basculerOutilsAdmin;
window.basculerEcoutePassiveCible = basculerEcoutePassiveCible;
window.selectVehicle = selectVehicle;
window.hideVehicleDetails = hideVehicleDetails;
window.triggerManualSOS = triggerManualSOS;
window.ajouterAlerte = ajouterAlerte;
window.supprimerAlerte = supprimerAlerte;
window.demarrerMoniteurSecousse = demarrerMoniteurSecousse;
window.declencherAlerteFauxCode = declencherAlerteFauxCode;
window.mettreAJourInterfaceArchives = mettreAJourInterfaceArchives;
window.updateVehicleList = updateVehicleList;
