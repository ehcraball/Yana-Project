YANA : You Are Not Alone
Une application mobile de soutien et d’organisation personnelle, basée sur FastAPI (backend) et React Native via Expo (frontend).
🚀 Démarrage rapide
1. Cloner le projet
  git clone https://github.com/votre-utilisateur/yana-project.git
  cd yana-project
2. Configuration du backend
  - Aller dans le dossier backend
  - Créer un fichier .env à la racine de ce dossier
  - Copier-coller le contenu de .env.example dans .env et ajuster si besoin (mot de passe, etc.)
3. Lancer les services avec Docker
  Assurez-vous d’avoir Docker et Docker Compose installés.
  Depuis la racine du projet (là où se trouve docker-compose.yml), exécutez :
  docker compose up --build
  Le backend sera accessible à l’adresse : http://localhost:8000
4. Configuration du frontend (Expo)
  a. Mettre à jour l'URL de l’API
  Dans Aboh-app/components/api.tsx, remplacez l'URL de base par votre IP locale ou publique (celle de la machine qui héberge le backend) :
  export const API_URL = 'http://192.168.X.X:8000';
  b. Installer les dépendances
  cd Aboh-app
  npm install
  c. Lancer Expo
  npx expo start
  Scannez le QR code affiché avec l’application Expo Go sur votre téléphone.
  L’application mobile se lancera automatiquement.


🛠️ Dépendances nécessaires
  Backend
  - FastAPI
  - SQLAlchemy
  - asyncpg
  - python-dotenv
  - python-multipart
  - email-validator
  Frontend
  - Expo SDK 53
  - React Native 0.79
  - React Navigation
  - Async Storage
  - Lottie
  - Toast, etc.
  - 
  ✅ À vérifier avant de lancer
  - Docker fonctionne et les conteneurs se lancent correctement
  - L’adresse IP utilisée dans api.tsx est bonne
  - Votre téléphone et votre machine sont sur le même réseau Wi-Fi
  - Vous utilisez bien npx expo (et non expo) pour éviter les erreurs liées à la version dépréciée de expo-cli
