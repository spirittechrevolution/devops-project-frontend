# Résumé de configuration Frontend

Guide de référence rapide pour la configuration Docker et CI/CD du frontend.

## Fichiers dans ce répertoire

### Fichiers principaux
- `Dockerfile` - Configuration de l'image container
- `nginx.conf` - Configuration du serveur web
- `package.json` - Dépendances Node.js
- `vite.config.js` - Configuration de l'outil de build

### Documentation
| Fichier | Objectif |
|---------|----------|
| `README.md` | Présentation du projet et démarrage rapide |
| `DOCKER.md` | Documentation spécifique à Docker |
| `DOCKER_CONFIG.md` | Configuration Docker détaillée |
| `GITHUB_CI_CD.md` | Guide CI/CD GitHub Actions |

### Modèles de configuration
- `.github-workflows/frontend-docker-build-push.yml` - Modèle de référence du workflow
- `.env.example` - Modèle de variables d'environnement
- `.dockerignore` - Fichiers exclus du build Docker

## Commandes rapides

### Développement local
```bash
npm install
npm run dev
```

### Build & Lancement Docker
```bash
docker build -t frontend:latest .
docker run -p 5173:80 frontend:latest
```

### Docker Compose (depuis le dossier backend)
```bash
cd ../projet-devops
docker-compose up -d
```

## Workflow du pipeline CI/CD

### Automatisé avec GitHub Actions

**Événements déclencheurs :**
- Push sur la branche `main` → Build & Push sur Docker Hub
- Création du tag `v*` → Build & Push avec tags de version
- Pull Request → Build uniquement (pas de push Docker Hub)

**Emplacement du workflow :**
`.github/workflows/frontend-docker-build-push.yml` (niveau racine)

**Image publiée :**
```
spirittechrevolution/devops-project-frontend:latest
spirittechrevolution/devops-project-frontend:v1.0.0
```

## Prérequis

### Secrets GitHub requis
Configurer dans : Paramètres du dépôt → Secrets and variables → Actions

| Secret | Valeur |
|--------|--------|
| `DOCKER_USERNAME` | Nom d'utilisateur Docker Hub |
| `DOCKER_TOKEN` | Token d'accès Docker Hub |

### Dépôts Docker Hub
- `spirittechrevolution/devops-project-frontend` (frontend)

## Fichiers de configuration

### .dockerignore
Exclut du build Docker :
```
node_modules/
dist/
.git/
.env.local
```

### Dockerfile
Build multi-étapes :
1. **Étape Builder** : Node 18 Alpine
2. **Étape Runtime** : Nginx Alpine
Taille finale : ~30-40 Mo

### nginx.conf
Fonctionnalités :
- Routage SPA (React Router)
- Proxy API (/api → backend)
- En-têtes de sécurité
- Compression Gzip
- Cache navigateur (30 jours)

## Points d'intégration

### API Backend
```
Développement :  http://localhost:3000/api/v1
Production :     https://api.example.com/api/v1
```

**Proxy dans nginx.conf :**
```
location /api/ {
  proxy_pass http://api:3000;
}
```

### Réseau Docker Compose
Le frontend communique avec le backend via :
```
http://api:3000/api/v1
```

## Stratégie de tags des images

Tags appliqués automatiquement par GitHub Actions :

| Événement Git | Tags |
|---------------|------|
| Push sur main | `latest`, `main`, `sha-abc123` |
| Tag v1.2.3 | `v1.2.3`, `1.2`, `1`, `latest` |
| Pull Request | `pr-42` (non publié) |

## Configuration du build

### Config Vite
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### Scripts npm
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Sécurité

### Ne jamais committer
- Fichiers `.env` contenant des secrets
- Credentials Docker
- Clés API

### Toujours utiliser
- GitHub Secrets pour le CI/CD
- Variables d'environnement pour la configuration
- `.dockerignore` pour le contexte de build

## Checklist

### Configuration initiale
- [ ] Cloner le dépôt
- [ ] Configurer les secrets GitHub (`DOCKER_USERNAME`, `DOCKER_TOKEN`)
- [ ] Créer le dépôt Docker Hub `devops-project-frontend`
- [ ] Mettre à jour cette documentation si les chemins changent

### Développement
- [ ] `npm install` pour les dépendances
- [ ] `npm run dev` pour démarrer le serveur de développement
- [ ] Tester les appels API vers le backend
- [ ] Build local : `npm run build`

### Tests Docker
- [ ] `docker build .` - construire localement
- [ ] `docker run` - tester le container
- [ ] Vérifier le health check : `curl http://localhost/health`
- [ ] Vérifier les logs Nginx : `docker logs <container>`

### Déploiement
- [ ] Pousser le code sur la branche main
- [ ] Vérifier que le workflow GitHub Actions se déclenche
- [ ] Vérifier l'image sur Docker Hub
- [ ] Tirer l'image : `docker pull spirittechrevolution/devops-project-frontend:latest`
- [ ] Lancer avec docker-compose

## Résolution des problèmes

Consulter les fichiers de documentation pour un dépannage détaillé :
- [DOCKER_CONFIG.md](./DOCKER_CONFIG.md#résolution-des-problèmes)
- [GITHUB_CI_CD.md](./GITHUB_CI_CD.md#résolution-des-problèmes)

Corrections rapides :
```bash
# Port déjà utilisé ?
docker run -p 8080:80 frontend

# Build échoué ?
docker build --no-cache .

# Logs ?
docker logs <container-id>

# API ne fonctionne pas ?
docker exec frontend env | grep VITE_API_URL
```

## Carte de la documentation

```
project_devops_front/
├── README.md                          # Démarrage rapide & présentation
├── DOCKER.md                          # Spécificités Docker
├── DOCKER_CONFIG.md                   # Configuration détaillée
├── GITHUB_CI_CD.md                    # Configuration GitHub Actions
├── CONFIGURATION_SUMMARY.md           # Ce fichier
│
├── .github-workflows/
│   └── frontend-docker-build-push.yml # Modèle de workflow de référence
│
├── Dockerfile                         # Définition de l'image container
├── nginx.conf                         # Configuration Nginx
├── .env.example                       # Modèle d'environnement
├── .dockerignore                      # Exclusions du build Docker
├── vite.config.js                     # Configuration de l'outil de build
├── package.json                       # Dépendances
│
└── src/                               # Code source React
```

## Documentation associée

- **README racine** : [../README.md](../README.md)
- **Guide Docker complet** : [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md)
- **Guide GitHub Actions** : [../GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md)
- **Configuration des secrets** : [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md)

## Support

En cas de problème :
1. Consulter le fichier `.md` correspondant dans ce répertoire
2. Vérifier les logs GitHub Actions dans l'onglet Actions
3. Vérifier les logs Docker : `docker logs <container>`
4. Consulter la documentation au niveau racine

## Informations de version

- **Frontend** : React 18.2.0, Vite 5.0.0
- **Container** : Nginx Alpine, Node 18 Alpine
- **Docker** : 20.10+
- **Mis à jour** : 28 Mars 2026