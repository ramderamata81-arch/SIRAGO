/**
 * SiraGO Mobile Configuration
 * Centralisation de la configuration de l'URL du Backend
 */

// ✅ URL POUR LES APPAREILS PHYSIQUES SUR LE MÊME WIFI
const IP_LOCALE = "192.168.100.9"; 
const BASE_URL = `http://${IP_LOCALE}:5000`; 

const CONFIG = {
    API_URL: BASE_URL,
    SOCKET_URL: BASE_URL,
    UPLOAD_URL: `${BASE_URL}/uploads`,
    GOOGLE_MAPS_API_KEY: '', 
};

export default CONFIG;
