# Configuration Docker Frontend

Ce fichier documente la configuration Docker spécifique au frontend.

## Référence rapide

### Construction

```bash
# Construction locale
docker build -t devops-project-frontend:latest .

# Construction avec tag
docker build -t spirittechrevolution/devops-project-frontend:v1.0.0 .
```

### Lancement

```bash
# Développement
docker run -p 5173:80 devops-project-frontend:latest

# Production
docker run -d \
  --name frontend \
  -p 80:80 \
  -e VITE_API_URL=https://api.example.com/api/v1 \
  spirittechrevolution/devops-project-frontend:latest
```

### Publication sur Docker Hub

```bash
# Connexion
docker login

# Publication
docker push spirittechrevolution/devops-project-frontend:v1.0.0
docker push spirittechrevolution/devops-project-frontend:latest
```

## Vue d'ensemble du Dockerfile

**Emplacement** : `./Dockerfile`

### Couches du build

```
Couche 1 : Node Builder (node:18-alpine)
├── npm ci (dépendances verrouillées)
├── Copie du code source
└── npm run build → dist/

Couche 2 : Nginx Runtime (nginx:alpine)
├── Suppression de la config Nginx par défaut
├── Ajout du nginx.conf personnalisé
├── Copie de dist/ depuis le builder
├── Ajout du health check
└── Démarrage : nginx daemon off
```

### Analyse de la taille

| Image | Taille | Note |
|-------|--------|------|
| node:18-alpine | 170 Mo | Étape de build |
| Image finale | 30-40 Mo | Après le multi-stage |
| Réduction | 80-82% | Gain considérable |

## Configuration Nginx

**Emplacement** : `./nginx.conf`

### Fonctionnalités

- Routage SPA (`try_files $uri /index.html`)
- Proxy API (`/api/* → http://api:3000`)
- En-têtes de sécurité (CSP, X-Frame-Options, etc.)
- Compression Gzip (assets texte)
- Cache navigateur (30 jours pour les fichiers statiques)
- Endpoint de health check (`/health`)

### Personnalisation

Modifier `nginx.conf` pour adapter :
- Le nom de serveur / nom d'hôte
- La cible du proxy API
- Les en-têtes de sécurité
- Les en-têtes de cache
- Les routes supplémentaires

## Configuration des variables d'environnement

### Au moment du build (Vite)

Variables utilisées lors du `npm run build` :

**Depuis `.env` ou les arguments Docker build :**
```
VITE_API_URL=http://localhost:3000/api/v1
```

### À l'exécution (Container)

Variables d'environnement du container (si nécessaire) :

```bash
docker run -e VITE_API_URL=https://api.example.com/api/v1 frontend
```

**Note** : L'environnement Vite est intégré au moment du build, il n'est pas modifiable à l'exécution.

Pour changer l'URL de l'API à l'exécution, modifier le proxy API dans `nginx.conf` à la place.

## .dockerignore

**Fichier** : `./.dockerignore`

Fichiers exclus du build Docker :

```
node_modules/          # Ne pas copier, reconstruire depuis zéro
npm-debug.log          # Artefacts de build
dist/                  # Sera reconstruit
.git/                  # Contrôle de version
.gitignore             # Configuration Git
.env.local             # Secrets
```

Cela garde le contexte de build léger et rapide.

## Intégration GitHub Actions

**Workflow** : `.github/workflows/frontend-docker-build-push.yml`

### Automatisation

GitHub Actions :
1. Surveille les modifications sur la branche `main`
2. Surveille les tags de version (`v*`)
3. Construit l'image automatiquement
4. Publie sur Docker Hub (main/tags uniquement)
5. Ignore la publication sur les PR (sécurité)

### Déclenchement manuel

Pour déclencher manuellement un build depuis l'interface GitHub :

1. Aller dans l'onglet Actions
2. Sélectionner "Build and Push Frontend to Docker Hub"
3. Cliquer sur "Run workflow" → Sélectionner la branche
4. Choisir si on publie (nécessite une clé API, ignoré une fois le run démarré)

## Configuration réseau

### Docker Compose (Développement)

```yaml
frontend:
  build: ./project_devops_front
  ports:
    - "5173:80"
  environment:
    VITE_API_URL: http://api:3000/api/v1
  depends_on:
    - api
  networks:
    - projet_devops_network
```

**Communication entre containers :**
- Frontend → API : `http://api:3000/api/v1`
- URL du frontend : `http://localhost:5173`

### Docker Compose (Production)

```yaml
frontend:
  image: spirittechrevolution/devops-project-frontend:latest
  ports:
    - "80:80"
  environment:
    VITE_API_URL: https://api.example.com/api/v1
  depends_on:
    - api
```

**Note** : En production, l'URL de l'API vient de l'environnement, le proxy Nginx gère le routage.

## Health Check

### Endpoint

```
GET /health
```

**Réponse :**
```
HTTP/1.1 200 OK
Content-Type: text/plain

healthy
```

### Health Check Docker

Le container inclut :

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

**Statut** :
```bash
docker inspect frontend --format='{{.State.Health.Status}}'
# Résultat : healthy / unhealthy / none
```

## Montages de volumes

### Développement

Monter le code source pour le rechargement à chaud :

```bash
docker run -v $(pwd)/src:/usr/share/nginx/html/src frontend
```

**Note :** Nécessite une configuration Nginx spéciale pour le rechargement à chaud (non incluse dans la config standard).

### Production

Aucun montage de volume recommandé. L'image contient tout le nécessaire.

```bash
docker run -d frontend
# L'image est autonome
```

## Correspondance des ports

### Configuration standard

| Interne | Externe | Usage |
|---------|---------|-------|
| 80 | 5173 (dev) / 80 (prod) | Trafic HTTP |

### Ports personnalisés

Configurer via Docker ou docker-compose :

```yaml
ports:
  - "8080:80"  # Accès sur le port 8080
```

## Logs

### Logs Docker

```bash
# Voir les logs
docker logs frontend

# Suivre les logs (streaming)
docker logs -f frontend

# 100 dernières lignes avec horodatage
docker logs --timestamps -n 100 frontend
```

### Emplacement des logs (dans le container)

Logs Nginx : `/var/log/nginx/access.log` et `error.log`

**Pour consulter depuis l'intérieur du container :**
```bash
docker exec frontend tail -f /var/log/nginx/access.log
```

## Optimisation des performances

### Performance du build

**Stratégie de cache :**
- Couche de dépendances séparée (npm ci)
- Cette couche ne change souvent pas, ce qui accélère les builds
- Builds suivants : ~3-4 minutes

**Optimisation :**
```dockerfile
# Bien - copier d'abord uniquement les fichiers de paquets
COPY package*.json ./
RUN npm ci

# Mal - copier tout d'abord
COPY . .
RUN npm ci
```

### Performance à l'exécution

**Réglages Nginx :**
- Gzip activé (réduit le transfert de 60-80%)
- Cache navigateur 30 jours (réduit les requêtes)
- Keep-alive activé
- Surcharge minimale des en-têtes

**Métriques :**
- Chargement de page : ~500ms-1s
- Transfert de l'image : ~100-200 Ko (gzippé)
- Assets statiques : servis depuis le cache navigateur

## Résolution des problèmes

### L'image ne se construit pas

**Erreur** : `ERR! code ERESOLVE`

**Cause** : Conflit de dépendances dans npm

**Solution** :
1. Vérifier que la version de Node correspond
2. Mettre à jour package-lock.json : `npm install`
3. Utiliser `npm ci --legacy-peer-deps` si nécessaire

### Le container ne démarre pas

**Erreur** : `nginx: [emerg] bind() to 0.0.0.0:80 failed`

**Cause** : Le port 80 est déjà utilisé

**Solution** :
- Utiliser un port différent : `-p 8080:80`
- Ou arrêter le container en conflit : `docker stop <nom>`

### Les appels API échouent depuis le frontend

**Erreur** : `Failed to fetch` ou erreur CORS

**Cause** : `VITE_API_URL` incorrecte

**Solution** :
1. Vérifier la variable d'environnement `VITE_API_URL`
2. L'API doit être accessible à l'URL spécifiée
3. Vérifier la configuration du proxy Nginx dans `nginx.conf`

### Build lent

**Symptôme** : Le build prend plus de 10 minutes

**Causes :**
- Premier build (pas de cache)
- node_modules volumineux
- Problèmes réseau lors du téléchargement des paquets

**Solutions** :
- Lancer des builds suivants (utilisation du cache)
- Vérifier les ressources de la machine
- Augmenter la mémoire Docker : Settings → Resources

## Sécurité

### Permissions

Le container s'exécute en tant que :
- **Utilisateur** : `root` (requis par Nginx)
- **Groupe** : `root`

**Note** : Nginx lui-même ne s'exécute pas avec des privilèges, mais le container a besoin de root pour lier le port 80.

### Secrets

Ne jamais inclure dans l'image :
- Fichiers `.env`
- Clés API
- Mots de passe

Utiliser à l'exécution :
- Variables d'environnement
- Secrets montés
- Fichiers de configuration

### Sécurité des images de base

Mises à jour régulières :
- `node:18-alpine` - mis à jour régulièrement
- `nginx:alpine` - mis à jour régulièrement

**Vérifier les vulnérabilités :**
```bash
docker scan spirittechrevolution/devops-project-frontend
```

## Maintenance

### Mise à jour des images de base

```bash
# Vérifier les mises à jour
docker pull nginx:alpine
docker pull node:18-alpine

# Reconstruire pour obtenir la dernière base
docker build --no-cache .
```

### Suppression des anciennes images

```bash
# Supprimer une image spécifique
docker rmi spirittechrevolution/devops-project-frontend:old-tag

# Supprimer les images orphelines
docker image prune

# Supprimer les images inutilisées
docker image prune -a
```

## Références

- [Bonnes pratiques Dockerfile](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Configuration Nginx](https://nginx.org/en/docs/ngx_core_module.html)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux](https://www.alpinelinux.org/)