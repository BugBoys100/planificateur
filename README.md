# 📅 Auto-Planificateur (Planning)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

Auto-Planificateur est une application web de gestion de planning et d'emploi du temps, conçue pour être facilement auto-hébergeable (parfait pour un Raspberry Pi). Elle offre une interface moderne, une gestion des utilisateurs sécurisée et une synchronisation de calendrier (iCal). L'application est prête à l'emploi : aucune configuration de variables d'environnement n'est requise.

## ✨ Fonctionnalités principales

- 🔐 **Authentification sécurisée** : Connexion par JWT via des cookies sécurisés et mots de passe hachés.
- 👥 **Gestion des rôles** : Rôles `admin` et `user` avec permissions différenciées.
- 🎨 **Personnalisation** : Interface compatible Mode Sombre / Clair / Système et thèmes de couleurs.
- 📅 **Synchronisation iCal** : Export dynamique du planning au format `.ics` sécurisé par token (compatible Google Agenda, Apple Calendar...).
- 📜 **Audit et Logs** : Journalisation des actions consultable par les administrateurs.
- ⚡ **Performance locale** : Base de données SQLite ultra-rapide embarquée via Drizzle ORM.

## 🚀 Prérequis

- Node.js (Version 18.x ou supérieure)
- npm (ou pnpm/yarn)

## 📦 Installation et Lancement

Le projet est conçu pour être "Plug & Play", sans configuration complexe.

**1. Cloner le dépôt :**
```bash
git clone [https://github.com/BugBoys100/planificateur.git](https://github.com/BugBoys100/planificateur.git)
cd planificateur
```

**2. Installer les modules :**
```bash
npm install
```

**3. Lancer l'application (Mode Développement) :**
```bash
npm run dev
```
L'application est maintenant accessible sur `http://localhost:3000`.

## 🔑 Identifiants par défaut

Lors du premier lancement, un compte administrateur est automatiquement disponible avec ces identifiants :

- **Identifiant :** `username`
- **Mot de passe :** `password`

*(⚠️ Il est fortement recommandé de modifier ce mot de passe depuis la page des paramètres dès votre première connexion).*

## 🍓 Déploiement sur Raspberry Pi (Production)

Ce projet est optimisé pour tourner sur un Raspberry Pi.

1. Transférez vos fichiers (via Cyberduck ou SFTP) ou clonez le dépôt directement sur le Raspberry Pi.
2. Installez les dépendances :
```bash
npm install
```
3. Compilez l'application :
```bash
npm run build
```
4. Démarrez l'application :
```bash
npm run start
```

*(💡 **Astuce** : Pour que l'application tourne en arrière-plan de manière permanente, utilisez PM2 : `pm2 start npm --name "planning" -- run start`).*

## 📁 Structure du projet

- `src/app/` : Routes de l'application (Pages & API Next.js)
- `src/components/` : Composants React réutilisables
- `src/db/` : Configuration de la base de données et schémas
- `src/lib/` : Utilitaires (authentification, logs, etc.)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :
1. Forkez le projet.
2. Créez une branche (`git checkout -b feature/NouvelleFonctionnalite`).
3. Commitez vos changements.
4. Poussez vers la branche (`git push origin feature/NouvelleFonctionnalite`).
5. Ouvrez une Pull Request.

## 📄 Licence

Ce projet est open-source et distribué sous la licence MIT.
