# DevOps Project Frontend

Frontend pour le projet DevOps utilisant React + Vite.

## 🚀 Démarrage rapide

### Installation des dépendances
```bash
npm install
```

### Développement
```bash
npm run dev
```
Le serveur de développement démarrera sur http://localhost:3000

### Build pour la production
```bash
npm run build
```

### Preview du build
```bash
npm run preview
```

## 📁 Structure du projet

```
project_devops_front/
├── src/
│   ├── App.jsx      # Composant principal
│   ├── App.css      # Styles du composant App
│   ├── index.css    # Styles globaux
│   └── main.jsx     # Point d'entrée
├── public/          # Fichiers statiques
├── index.html       # HTML principal
├── vite.config.js   # Configuration Vite
├── package.json     # Dépendances
└── README.md        # Documentation
```

## 🛠️ Technologies utilisées

- **React** 18.2.0 - Bibliothèque UI
- **Vite** 5.0.0 - Build tool rapide
- **Axios** - Client HTTP pour les requêtes API

## 📡 API Configuration

Le proxy API est configuré dans `vite.config.js` :
- Les requêtes vers `/api/*` sont redirigées vers `http://localhost:3000/api/v1`

Exemple d'utilisation :
```javascript
import axios from 'axios'

// Cette requête ira vers http://localhost:3000/api/v1/users
axios.get('/api/users')
```

## 🐳 Docker

### Build de l'image Docker

```bash
# Image locale
docker build -t devops-frontend:latest .

# Image Docker Hub
docker build -t spirittechrevolution/devops-project-frontend:latest .
```

### Exécution du conteneur

```bash
# Développement
docker run -p 5173:80 devops-frontend:latest

# Production avec configuration API
docker run -d \
  -p 80:80 \
  -e VITE_API_URL=https://api.example.com/api/v1 \
  spirittechrevolution/devops-project-frontend:latest
```

### Avec Docker Compose

```bash
# Depuis le répertoire du backend
cd ../projet-devops

# Démarrer tous les services
docker-compose up -d

# Accès frontend: http://localhost:5173
```

**Caractéristiques du Dockerfile:**
- ✅ Build multi-stage (réduction de ~90%)
- ✅ Node 18 Alpine (builder)
- ✅ Nginx Alpine (production)
- ✅ Gzip compression
- ✅ Health check
- ✅ Security headers
- ✅ SPA routing

Pour plus de détails, voir [DOCKER_CONFIG.md](./DOCKER_CONFIG.md)

## 🔄 GitHub Actions CI/CD

Le frontend est automatiquement construit et poussé vers Docker Hub lors:
- ✅ Push sur la branche `main`
- ✅ Création de tags de version (`v1.0.0`, etc.)
- ✅ Pull requests (build uniquement, pas de push)

### Workflow

**Fichier**: `.github/workflows/frontend-docker-build-push.yml`

**Images générées**:
- Image: `spirittechrevolution/devops-project-frontend`
- Tags: `latest`, `v1.0.0`, `main`, `sha-{commit}`
- Registry: Docker Hub

### Configuration requise

1. **Docker Hub**
   - Username: `spirittechrevolution`
   - Repository: `devops-project-frontend`

2. **GitHub Secrets**
   - `DOCKER_USERNAME` → Docker Hub username
   - `DOCKER_TOKEN` → Docker Hub access token

Voir [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) pour les détails de configuration.

### Déploiement automatique

```bash
# Créer un tag de version
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions:
# 1. Détecte le tag
# 2. Construit l'image
# 3. La pousse vers Docker Hub avec:
#    - v1.0.0
#    - 1.0
#    - 1
#    - latest
```

## 📚 Documentation complète

- [DOCKER.md](./DOCKER.md) - Configuration Docker détaillée
- [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) - Paramètres Docker avancés
- [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) - GitHub Actions et CI/CD
- [../README.md](../README.md) - Documentation du projet complet

## 📝 Notes

- Modifiez les fichiers dans `src/` et le navigateur se rechargera automatiquement (HMR)
- Le build de production optimise et minifie le code
- Le conteneur Docker crée une image optimisée pour la production
- Les images sont automatiquement publiées sur Docker Hub via GitHub Actions
