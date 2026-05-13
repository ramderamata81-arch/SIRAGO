# SiraGO Admin Pro Dashboard

Bienvenue dans le nouveau centre de contrôle professionnel SiraGO. Cette version utilise **React** et **Tailwind CSS** pour une interface moderne et performante.

## 📖 Structure du Projet

- **`admin-pro/`** : Contient le nouveau site web professionnel (React). **C'est ici que vous devez travailler.**
- **`legacy/`** : Dossier contenant l'ancienne version statique (Vanilla JS) à titre de référence.

## 🚀 Comment lancer le site (IMPORTANT)

Contrairement à l'ancienne version, vous ne pouvez pas simplement double-cliquer sur `index.html`. Pour que React et Tailwind fonctionnent, vous devez lancer un serveur de développement :

1.  **Ouvrez un terminal** dans le dossier racine du projet.
2.  **Allez dans le dossier du site** :
    ```powershell
    cd admin-pro
    ```
3.  **Installez les dépendances** (si ce n'est pas déjà fait) :
    ```powershell
    npm install
    ```
4.  **Lancez le site** :
    ```powershell
    npm run dev
    ```
5.  **Accédez au site** : Le terminal affichera une adresse (généralement `http://localhost:5173`). Copiez cette adresse dans votre navigateur.

## 🛡️ Fonctionnalités incluses
- Supervision en temps réel avec carte.
- Gestion des alertes SOS (clignotant).
- Validation des documents chauffeurs (KYC).
- Dashboard financier avec graphiques.
- Configuration des prix et notifications push.
