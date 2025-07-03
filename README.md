# Yana-Project
YANA Project - Mode d'emploi
Installe Docker et Docker Compose si ce n’est pas déjà fait.

Ouvre un terminal à la racine du projet où se trouve le fichier docker-compose.yml.

Lance la commande docker compose up --build pour démarrer la base de données PostgreSQL et le backend FastAPI.

Le backend sera accessible à l’adresse http://localhost:8000.

Ensuite, va dans le dossier Aboh-app (le frontend).

Lance la commande npm install ou yarn install pour installer les dépendances.

Puis lance npx expo start -c pour démarrer l’application Expo avec nettoyage du cache.

Pour utiliser l’application sur ton téléphone, ouvre l’app Expo Go et scanne le QR code affiché dans le terminal ou la page web d’Expo.

Pour éviter de mettre l’adresse IP du backend partout dans le code, crée un fichier config.ts dans le frontend où tu mets l’adresse du backend une fois, par exemple :
export const API_URL = 'http://192.168.x.x:8000'
et importe cette variable dans tes fichiers frontend pour faire les appels API.

Si tu changes des dépendances backend (fichier requirements.txt), arrête Docker, puis relance docker compose up --build pour reconstruire.

Si Expo te signale un problème avec la CLI, utilise npx expo au lieu de expo directement.

!!!!!!!!!!ATTENTION!!!!!!!!!!

Si vous n'arrivez pas à accéder au backend depuis l'app, c'est surement votre parefeu (parefeu windows copris). Vous pouvez le désactiver le temps de l'utilisation de l'app.
