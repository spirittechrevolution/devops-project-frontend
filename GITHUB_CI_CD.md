# Configuration CI/CD GitHub Actions Frontend

Ce répertoire contient la documentation et la configuration du pipeline CI/CD GitHub Actions pour le frontend.

## Vue d'ensemble

L'application frontend est automatiquement construite et publiée sur Docker Hub à chaque push sur la branche main ou lors de la création de tags de version.

## Configuration du workflow

**Workflow actif** : `.github/workflows/frontend-docker-build-push.yml` (niveau racine)

Ce workflow :
- Construit l'image Docker frontend (multi-étapes : Node builder + Nginx)
- Publie sur Docker Hub lors des pushs sur la branche main
- Construit ET publie lors de la création de tags de version (v1.0.0, etc.)
- Construit uniquement (pas de push) sur les pull requests
- Utilise le cache GitHub Actions pour des builds plus rapides
- Tague automatiquement les images avec le versionnage sémantique

## Détails de l'image

| Propriété | Valeur |
|-----------|--------|
| **Nom de l'image** | `spirittechrevolution/devops-project-frontend` |
| **Registre** | Docker Hub (`docker.io`) |
| **Image de base** | `nginx:alpine` (production) |
| **Durée du build** | ~3-5 minutes |
| **Taille de l'image** | ~30-40 Mo |
| **URL Docker Hub** | https://hub.docker.com/r/spirittechrevolution/devops-project-frontend |

## Événements déclencheurs

### Build automatique & Push

Le workflow s'exécute et **publie sur Docker Hub** lorsque :
- Du code est poussé sur la branche `main`
- Un tag de version est créé : `git tag v1.0.0`

### Build uniquement (pas de push)

Le workflow s'exécute mais **ne publie PAS** lorsque :
- Une pull request est ouverte sur main
- D'autres branches sont poussées (pas main)

## Déclencheurs Git pour le frontend

Le workflow frontend se déclenche uniquement sur :

```yaml
paths:
  - 'project_devops_front/**'        # Modifications frontend
  - '.github/workflows/frontend-*'  # Modifications du workflow frontend
```

Cela évite des builds inutiles lorsque seul le code backend change.

## Stratégie de tags des images

Les images sont automatiquement taguées selon les événements Git :

### Push sur main
```
Tags :
  - latest
  - main
  - sha-abc1234
```

### Création d'un tag de version (git tag v1.2.3)
```
Tags :
  - v1.2.3
  - 1.2
  - 1
  - latest
  - sha-abc1234
```

### Pull Request
```
Tags :
  - pr-42
  - sha-abc1234

Note : NON publié sur Docker Hub, seulement construit
```

## Prérequis

### 1. Configuration Docker Hub

Créer des dépôts Docker Hub :

**Dépôt Backend**
- Nom : `devops-project`
- Description : Container API backend
- Visibilité : Public

**Dépôt Frontend**
- Nom : `devops-project-frontend`
- Description : Container Frontend React/Vite
- Visibilité : Public

Accès : https://hub.docker.com/orgs/spirittechrevolution

### 2. Secrets GitHub

Configurer dans : **Paramètres du dépôt → Secrets and variables → Actions**

| Secret | Valeur |
|--------|--------|
| `DOCKER_USERNAME` | Votre nom d'utilisateur Docker Hub |
| `DOCKER_TOKEN` | Token d'accès Docker Hub (PAS le mot de passe) |

**Générer un token Docker Hub** :
1. Aller sur https://hub.docker.com/settings/security
2. Cliquer sur "New Access Token"
3. Nom : `github-actions`
4. Permissions : Read & Write
5. Copier le token dans le secret GitHub `DOCKER_TOKEN`

## Variables d'environnement

### Au moment du build (Build Vite)

Le build frontend utilise ces variables (si nécessaire) :

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

### À l'exécution (Nginx)

Le container frontend utilise ces variables :

```bash
VITE_API_URL=https://api.example.com/api/v1  # En production
```

## Détails du Dockerfile

**Emplacement** : `project_devops_front/Dockerfile`

**Build multi-étapes** :

```
Étape 1 : Node 18 Alpine (Builder)
├── npm ci (installation des dépendances)
└── npm run build (création de dist/)

Étape 2 : Nginx Alpine (Runtime)
├── Copie de dist/ depuis le builder
├── Configuration Nginx
├── Endpoint de health check
└── Exposition du port 80
```

**Fonctionnalités** :
- Le multi-étapes réduit la taille finale de l'image de ~90%
- Alpine Linux pour un encombrement minimal
- Support des utilisateurs non-root
- Health check pour l'orchestration
- Routage SPA automatique

## Exécution du workflow

### Processus étape par étape

1. **Récupération du code**
   - Clone le dépôt au commit courant

2. **Configuration de Docker Buildx**
   - Active les fonctionnalités avancées de build Docker
   - Supporte les builds multi-plateformes

3. **Connexion à Docker Hub** (si pas une PR)
   - Utilise les secrets `DOCKER_USERNAME` et `DOCKER_TOKEN`
   - Uniquement sur les pushs sur main ou les tags

4. **Extraction des métadonnées**
   - Génère les tags selon l'événement Git
   - Crée les labels avec les informations de build

5. **Build & Push**
   - Construit l'image Docker
   - Utilise la couche de cache GitHub Actions
   - Publie sur Docker Hub (si pas une PR)

6. **Notification de succès**
   - Affiche un message de confirmation
   - Image disponible sur Docker Hub

### Durée typique d'un build

- **Premier run** : ~5-7 minutes (construction du cache)
- **Runs suivants** : ~3-4 minutes (utilisation du cache)
- **Overhead CI/CD** : ~1 minute

## Surveillance des builds

### Voir les runs du workflow

1. Aller dans le dépôt → onglet **Actions**
2. Sélectionner le workflow **"Build and Push Frontend to Docker Hub"**
3. Cliquer sur un run pour voir les détails
4. Développer "Build and push Frontend Docker image" pour voir les logs

### Voir sur Docker Hub

1. Aller sur https://hub.docker.com/r/spirittechrevolution/devops-project-frontend
2. Cliquer sur l'onglet **Tags**
3. Voir toutes les versions disponibles
4. Le tag latest doit correspondre à votre push main récent

### Ligne de commande

```bash
# Voir les runs du workflow
gh run list --workflow=frontend-docker-build-push.yml

# Voir un run spécifique
gh run view <run-id> --log
```

## Résolution des problèmes

### Build échoue avec "No matching Dockerfile"

**Erreur** : `COPY failed: stat ... no such file`

**Solution** :
- Vérifier que le Dockerfile existe à : `project_devops_front/Dockerfile`
- Vérifier le chemin dans le workflow : `file: ./project_devops_front/Dockerfile`
- Le CI s'exécute depuis la racine du dépôt, pas depuis le répertoire frontend

### "Denied: insufficient_data" lors du push

**Erreur** : L'authentification échoue lors du push sur Docker Hub

**Solution** :
1. Vérifier que `DOCKER_USERNAME` est correct (sensible à la casse)
2. Vérifier que `DOCKER_TOKEN` est un token d'accès (pas un mot de passe)
3. Régénérer le token : https://hub.docker.com/settings/security
4. Mettre à jour le secret GitHub : Settings → Secrets → DOCKER_TOKEN

### Image construite mais non publiée

**Raison** : Événement Pull Request (intentionnel)

**Comportement** :
- Les builds sur PR sont testés sans publication
- Seuls les pushs sur la branche main déclenchent une publication sur Docker Hub
- Cela évite les écrasements accidentels d'images

**Vérifier** :
- Vérifier le type d'événement : "push" vs "pull_request"
- Regarder l'étape : "if: github.event_name != 'pull_request'"

### Timeout lors du build

**Erreur** : Le build prend plus longtemps que le timeout (généralement 6 heures)

**Solution** :
- Le niveau gratuit de GitHub Actions a une limite de 6 heures par job
- Les gros builds peuvent dépasser cette limite
- Configurer le timeout dans le workflow : `timeout-minutes: 30`

### Cache ne fonctionne pas

**Symptôme** : Chaque build prend le temps complet (pas plus rapide)

**Solution** :
- Le cache nécessite un historique de builds réussis
- Le premier build est lent, les suivants sont plus rapides
- Le cache persiste pendant 7 jours d'inactivité
- Vider manuellement le cache dans Settings → Actions

## Bonnes pratiques

### 1. Garder les secrets sécurisés

```bash
# Bien - utiliser les secrets GitHub
docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_TOKEN }}

# Mal - ne jamais coder en dur
docker login -u spirittechrevolution -p abc123secret
```

### 2. Utiliser le versionnage sémantique pour les tags

```bash
# Créer un tag de version
git tag v1.0.0
git push origin v1.0.0

# Cela déclenche automatiquement :
# - Le workflow
# - Le tag de l'image en v1.0.0, 1.0, 1, latest
```

### 3. Tester la PR avant la fusion

- Une PR déclenche le build (sans push)
- Vérifier les logs de build pour détecter les erreurs
- Fusionner uniquement si le build réussit

### 4. Surveiller la taille de l'image

Taille cible de l'image : 30-50 Mo

```bash
# Vérifier en local
docker build -t frontend:test .
docker images frontend:test

# Si > 100 Mo, vérifier le Dockerfile pour :
# - Dépendances inutilisées
# - node_modules volumineux
# - .dockerignore manquant
```

### 5. Nettoyage automatique

GitHub Actions nettoie automatiquement :
- L'ancien cache (inactif depuis 7+ jours)
- Les builds échoués
- Pas de nettoyage manuel nécessaire

## Configuration avancée

### Builds multi-plateformes

Pour construire pour ARM64 et AMD64 :

```yaml
platforms: linux/amd64,linux/arm64
```

Note : Nécessite une configuration QEMU ou buildx.

### Arguments de build personnalisés

Passer des variables lors du build :

```yaml
build-args: |
  BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  VCS_REF=${{ github.sha }}
```

### Push vers plusieurs registres

Se connecter à plusieurs registres et pousser sur tous :

```yaml
- name: Se connecter au registre personnalisé
  uses: docker/login-action@v2
  with:
    registry: registry.example.com
```

## Intégration avec d'autres workflows

### Workflow Backend (`docker-build-push.yml`)

- Construit le backend séparément
- S'exécute indépendamment du frontend
- Les deux peuvent se déclencher simultanément

### Workflow Full Stack (`docker-build-push-all.yml`)

- Construit le backend ET le frontend en parallèle
- Utile pour les releases coordonnées
- Attend que les deux réussissent avant de notifier

## Références

- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/build/architecture/)
- [API Docker Hub](https://docs.docker.com/docker-hub/api/latest/)
- [Versionnage sémantique](https://semver.org/)

## Support

En cas de problème :
1. Vérifier les logs du workflow dans l'onglet Actions
2. Consulter cette section de résolution des problèmes
3. Vérifier le statut du dépôt Docker Hub
4. Consulter la page de statut GitHub : https://www.githubstatus.com