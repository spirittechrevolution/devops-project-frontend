# Documentation Docker Frontend

## Vue d'ensemble

L'application frontend est conteneurisée avec un build Docker multi-étapes pour une taille et des performances optimales.

### Étapes du build
1. **Étape Builder** : Node.js 18 Alpine - compile l'application React avec Vite
2. **Étape Production** : Nginx Alpine - sert les fichiers statiques compilés

## Architecture

```
Container Frontend (Nginx)
    ├── Port 80 (HTTP)
    ├── Routage SPA (try_files)
    ├── Proxy API (/api/* -> Container API)
    └── En-têtes de sécurité & Cache
```

## Construction

### Développement local

```bash
# Construire l'image frontend
docker build -t projet_devops_frontend:latest .

# Ou depuis le répertoire racine
docker build -f project_devops_front/Dockerfile -t projet_devops_frontend:latest project_devops_front/
```

### Image de production

```bash
# Construire et tagger pour Docker Hub
docker build -t spirittechrevolution/devops-project-frontend:latest .

# Publier sur Docker Hub
docker push spirittechrevolution/devops-project-frontend:latest
```

## Docker Compose

### Développement

```bash
# Démarrer tous les services incluant le frontend
cd projet-devops
docker-compose up -d

# Voir les logs
docker-compose logs -f frontend

# Arrêter les services
docker-compose down
```

Le frontend sera accessible sur :
- **Local** : http://localhost:5173
- **Via proxy API** : http://localhost:5173/api/v1/*

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Configuration via fichier `.env` :
```
FRONTEND_PORT=80
VITE_API_URL=https://api.example.com/api/v1
```

## Fonctionnalités

### Configuration Nginx
- **Compression Gzip** : Activée pour les assets texte
- **Stratégie de cache** :
  - Assets statiques (cache 30 jours)
  - Index.html (pas de cache pour les mises à jour SPA)
- **En-têtes de sécurité** : X-Frame-Options, X-Content-Type-Options, etc.
- **Routage SPA** : Toutes les requêtes vers `/` sauf les appels API
- **Proxy API** : Route `/api/*` vers le container API backend
- **Health Check** : Endpoint `/health` pour l'orchestration

### Variables d'environnement

| Variable | Par défaut | Description |
|----------|------------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL de l'API backend |

## Réseau

Les deux containers communiquent sur le même réseau Docker :
- **Nom du réseau** : `projet_devops_network` (dev) / `projet_devops_network_prod` (prod)
- **Nom du container frontend** : `projet_devops_frontend` (dev) / `projet_devops_frontend_prod` (prod)
- **Nom d'hôte de l'API** : `api` (dev) / `api` (prod)

## Health Check

Le container frontend inclut un health check :
- **Endpoint** : `http://localhost/health`
- **Intervalle** : 30 secondes
- **Timeout** : 10 secondes
- **Tentatives** : 3
- **Période de démarrage** : 10 secondes

## Résolution des problèmes

### Le frontend retourne 404 pour les routes
C'est le comportement attendu - Nginx est configuré pour servir `index.html` pour toutes les routes (routage SPA).

### Les appels API échouent depuis le frontend
S'assurer que la variable d'environnement `VITE_API_URL` est correctement définie et que le container API est en bonne santé.

### Les assets statiques ne se chargent pas
Vérifier la configuration Nginx et s'assurer que le répertoire `/usr/share/nginx/html` contient les fichiers compilés.

### Taille d'image trop grande
S'assurer d'utiliser le build multi-étapes qui n'inclut que Nginx dans l'image finale, pas Node.js.

## Monitoring

Voir les statistiques du container :
```bash
docker-compose stats frontend
```

Voir les logs en temps réel :
```bash
docker-compose logs -f frontend
```

## Optimisation des performances

- **Build multi-étapes** : Réduit la taille finale de l'image (~30-40 Mo vs 300-500 Mo avec Node)
- **Cache Nginx** : Cache navigateur pour les assets statiques (30 jours)
- **Compression Gzip** : Réduit la taille de transfert
- **Alpine Linux** : Images de base légères

## Informations sur l'image

**Image de développement**
- Taille : ~30-40 Mo
- Base : `nginx:alpine`
- Prérequis : Docker, Docker Compose

**Image de production**
- Dépôt : `spirittechrevolution/devops-project-frontend`
- Tag : `latest`
- Disponible sur : Docker Hub