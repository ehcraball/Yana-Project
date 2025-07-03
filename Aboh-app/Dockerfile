# Utilise une image officielle Node LTS
FROM node:18

# Dossier de travail dans le container
WORKDIR /app

# Copie uniquement package.json + package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code source
COPY . .

# Expose les ports utilisés par Expo
EXPOSE 19000 19001 8081

# Commande par défaut pour démarrer Expo
CMD ["npx", "expo", "start", "--localhost"]
