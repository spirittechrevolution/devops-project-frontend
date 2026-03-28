# Index de configuration Frontend

Référence centrale pour toute la configuration, la documentation et la configuration CI/CD du frontend.

## Fichiers de documentation

Navigation rapide vers toute la documentation frontend :

### Premiers pas
- **[README.md](./README.md)** - Commencer ici ! Présentation du projet et guide de démarrage rapide
- **[CONFIGURATION_SUMMARY.md](./CONFIGURATION_SUMMARY.md)** - Référence rapide de toutes les configurations

### Docker & Conteneurisation
- **[DOCKER.md](./DOCKER.md)** - Documentation Docker spécifique au frontend
- **[DOCKER_CONFIG.md](./DOCKER_CONFIG.md)** - Configuration Docker détaillée et résolution des problèmes
  - Processus de build
  - Structure du Dockerfile
  - Configuration Nginx
  - Health checks
  - Optimisation des performances

### CI/CD & GitHub Actions
- **[GITHUB_CI_CD.md](./GITHUB_CI_CD.md)** - Documentation complète du workflow GitHub Actions
  - Déclencheurs du workflow
  - Stratégie de tags des images
  - Prérequis de configuration
  - Résolution des problèmes CI/CD

## Fichiers Docker

### Dockerfile
```bash
# Emplacement : ./Dockerfile
# Objectif : Build multi-étapes pour l'image de production
# Étapes de build :
#   1. Node 18 Alpine (builder)
#   2. Nginx Alpine (runtime)
# Taille finale : ~30-40 Mo
```

**Fonctionnalités clés :**
- Build multi-étapes (réduction de 90% de la taille)
- Alpine Linux pour un faible encombrement
- En-têtes de sécurité
- Compression Gzip
- Endpoint de health check
- Support du routage SPA

### nginx.conf
```bash
# Emplacement : ./nginx.conf
# Objectif : Configuration du serveur web Nginx
# Fonctionnalités :
#   - Routage SPA (try_files pour React Router)
#   - Proxy API vers le backend (/api -> http://api:3000)
#   - En-têtes de sécurité
#   - Compression Gzip
#   - En-têtes de cache navigateur
```

**Points de personnalisation :**
- Nom de serveur / domaine
- Cible du proxy API
- Durées de cache
- En-têtes de sécurité

## Configuration GitHub Actions

### Workflow actif
```
Emplacement : .github/workflows/frontend-docker-build-push.yml (niveau racine)

Déclencheurs :
  - Push sur la branche main
  - Création de tags de version (v1.0.0, etc.)
  - Pull requests (build uniquement, pas de push)

Actions :
  1. Construit l'image Docker
  2. Utilise le cache GitHub
  3. Se connecte à Docker Hub (si pas une PR)
  4. Publie l'image avec des tags sémantiques
```

### Modèle de fichier workflow
```
Emplacement : .github-workflows/frontend-docker-build-push.yml

Il s'agit d'une copie de référence du workflow.
Le workflow actif se trouve à : .github/workflows/frontend-docker-build-push.yml
```

## Fichiers de configuration

### .env.example
Modèle de variables d'environnement pour le développement :
```
VITE_API_URL=http://localhost:3000/api/v1
```

### .dockerignore
Fichiers exclus du build Docker :
- node_modules/ (reconstruit dans le container)
- .git/ (contrôle de version)
- .env.local (secrets)
- dist/ (reconstruit)

### vite.config.js
Configuration de l'outil de build :
- Proxy du serveur de développement
- Optimisation du build
- Configuration du port (5173)

### package.json
Dépendances Node.js :
- react (18.2.0)
- react-router-dom (7.13.2)
- axios (1.6.0)
- vite (5.0.0)

## Structure du projet

```
project_devops_front/
│
├── Documentation
│   ├── README.md                      # Démarrage rapide & présentation
│   ├── CONFIGURATION_SUMMARY.md       # Référence rapide
│   ├── CONFIG_INDEX.md                # Ce fichier
│   ├── DOCKER.md                      # Guide Docker
│   ├── DOCKER_CONFIG.md               # Détails Docker
│   └── GITHUB_CI_CD.md                # Guide CI/CD
│
├── Configuration Docker
│   ├── Dockerfile                     # Définition de l'image container
│   ├── nginx.conf                     # Configuration du serveur web
│   └── .dockerignore                  # Exclusions du build
│
├── Configuration du build
│   ├── vite.config.js                 # Paramètres Vite
│   ├── package.json                   # Dépendances
│   ├── package-lock.json              # Versions verrouillées
│   └── .env.example                   # Modèle d'environnement
│
├── Configuration CI/CD
│   └── .github-workflows/
│       └── frontend-docker-build-push.yml  # Modèle de workflow
│
├── Code source
│   ├── src/
│   │   ├── components/                # Composants React
│   │   ├── pages/                     # Composants de pages
│   │   ├── services/                  # Services API
│   │   ├── styles/                    # Fichiers CSS
│   │   ├── context/                   # React Context
│   │   ├── App.jsx                    # Composant racine
│   │   └── main.jsx                   # Point d'entrée
│   ├── public/                        # Assets statiques
│   ├── index.html                     # Modèle HTML
│   └── .gitignore                     # Exclusions Git
│
└── Autre
    └── .github-workflows/              # Workflows de référence (docs uniquement)
        └── frontend-docker-build-push.yml
```

## Checklist de démarrage rapide

### 1. Développement local
```bash
npm install
npm run dev
# Accès : http://localhost:5173
```

### 2. Tests Docker
```bash
docker build -t frontend:latest .
docker run -p 5173:80 frontend:latest
# Accès : http://localhost:5173
```

### 3. Docker Compose (depuis le dossier backend)
```bash
cd ../projet-devops
docker-compose up -d
# Frontend : http://localhost:5173
```

### 4. Déployer sur Docker Hub
```bash
docker tag frontend:latest spirittechrevolution/devops-project-frontend:latest
docker push spirittechrevolution/devops-project-frontend:latest

# Ou laisser GitHub Actions le faire :
git push origin main  # Build et push automatiques
```

## Références croisées

### Dans ce répertoire
- Voir [DOCKER.md](./DOCKER.md) pour les spécificités Docker
- Voir [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) pour la configuration avancée
- Voir [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) pour la configuration CI/CD

### Dans le répertoire racine
- [../README.md](../README.md) - Documentation complète du projet
- [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md) - Guide Docker complet
- [../GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md) - Guide GitHub Actions
- [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md) - Configuration des secrets
- [../DOCKER_BUILD.md](../DOCKER_BUILD.md) - Guide de build et déploiement

### Dans le répertoire Backend
- [../projet-devops/README.md](../projet-devops/README.md)
- [../projet-devops/DOCKER.md](../projet-devops/DOCKER.md)
- [../projet-devops/.github/workflows/](../projet-devops/.github/workflows/)

## Ordre de lecture

Selon les besoins :

### Je veux développer en local
1. [README.md](./README.md) - Démarrage rapide
2. [vite.config.js](./vite.config.js) - Configuration de développement

### Je veux construire des images Docker
1. [DOCKER.md](./DOCKER.md) - Vue d'ensemble
2. [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) - Détails
3. [Dockerfile](./Dockerfile) - Implémentation

### Je veux configurer le CI/CD
1. [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) - Guide de configuration
2. [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md) - Secrets
3. [.github-workflows/](../.github-workflows/) - Modèles

### Je veux déployer en production
1. [CONFIGURATION_SUMMARY.md](./CONFIGURATION_SUMMARY.md) - Vue d'ensemble
2. [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md) - Guide Docker complet
3. [../README.md](../README.md) - Section déploiement

## Variables de configuration clés

| Variable | Objectif | Exemple |
|----------|----------|---------|
| `DOCKER_USERNAME` | Auth Docker Hub | `spirittechrevolution` |
| `DOCKER_TOKEN` | Token Docker Hub | (stocké dans les secrets GitHub) |
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000/api/v1` |
| `REGISTRY` | Registre Docker | `docker.io` |
| `IMAGE_NAME` | Nom de l'image | `spirittechrevolution/devops-project-frontend` |

## Checklist de vérification

### Avant de committer
- [ ] `npm run build` réussit
- [ ] Le Dockerfile se construit localement : `docker build .`
- [ ] `.env.example` est à jour
- [ ] Documentation mise à jour

### Avant de pousser sur main
- [ ] Tous les tests passent (si applicable)
- [ ] L'image Docker se construit sur CI/CD
- [ ] Les secrets GitHub Actions sont configurés
- [ ] Le dépôt Docker Hub existe

### Après la fusion sur main
- [ ] Le workflow GitHub Actions se déclenche
- [ ] Le build réussit dans l'onglet Actions
- [ ] L'image est publiée sur Docker Hub
- [ ] Les nouveaux tags sont disponibles sur Docker Hub

## Obtenir de l'aide

1. **Problèmes de développement** : Consulter la section dépannage de [README.md](./README.md)
2. **Problèmes Docker** : Consulter la section dépannage de [DOCKER_CONFIG.md](./DOCKER_CONFIG.md)
3. **Problèmes CI/CD** : Consulter la section dépannage de [GITHUB_CI_CD.md](./GITHUB_CI_CD.md)
4. **Problèmes de configuration** : Consulter [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md)
5. **Aide générale** : Consulter [../README.md](../README.md)

## Statistiques des fichiers

| Catégorie | Nombre | Fichiers |
|-----------|--------|---------|
| Documentation | 6 | Fichiers .md |
| Configuration Docker | 3 | Dockerfile, nginx.conf, .dockerignore |
| Configuration du build | 5 | vite.config.js, package.json, .env.example, etc. |
| CI/CD | 1 | .github-workflows (modèles) |
| Code source | Multiple | Répertoire src/ |

## Historique des modifications

| Date | Modification |
|------|-------------|
| Mars 2026 | Configuration initiale |
| | Création de la configuration Docker |
| | Mise en place du CI/CD GitHub Actions |
| | Création de la documentation |

---

**Dernière mise à jour** : 28 Mars 2026