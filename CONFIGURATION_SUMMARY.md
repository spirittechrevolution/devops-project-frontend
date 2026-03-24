# Frontend Configuration Summary

Quick reference guide for the frontend Docker and CI/CD setup.

## 📁 Files in This Directory

### Core Files
- `Dockerfile` - Container image configuration
- `nginx.conf` - Web server configuration
- `package.json` - Node.js dependencies
- `vite.config.js` - Build tool configuration

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Project overview and quick start |
| `DOCKER.md` | Docker-specific documentation |
| `DOCKER_CONFIG.md` | Detailed Docker configuration |
| `GITHUB_CI_CD.md` | GitHub Actions CI/CD guide |

### Configuration Templates
- `.github-workflows/frontend-docker-build-push.yml` - Workflow template reference
- `.env.example` - Environment variables template
- `.dockerignore` - Files excluded from Docker build

## 🚀 Quick Commands

### Local Development
```bash
npm install
npm run dev
```

### Docker Build & Run
```bash
docker build -t frontend:latest .
docker run -p 5173:80 frontend:latest
```

### Docker Compose (from backend folder)
```bash
cd ../projet-devops
docker-compose up -d
```

## 🔄 CI/CD Pipeline Workflow

### Automated with GitHub Actions

**Trigger Events:**
- Push to `main` branch → Build & Push to Docker Hub
- Create tag `v*` → Build & Push with version tags
- Pull Request → Build only (no Docker Hub push)

**Workflow Location:**
`.github/workflows/frontend-docker-build-push.yml` (root level)

**Image Published:**
```
spirittechrevolution/devops-project-frontend:latest
spirittechrevolution/devops-project-frontend:v1.0.0
```

## Prerequisites

### GitHub Secrets Required
Set in: Repository Settings → Secrets and variables → Actions

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token |

### Docker Hub Repositories
- `spirittechrevolution/devops-project-frontend` (frontend)

## 📊 Configuration Files

### .dockerignore
Excludes from Docker build:
```
node_modules/
dist/
.git/
.env.local
```

### Dockerfile
Multi-stage build:
1. **Builder Stage**: Node 18 Alpine
2. **Runtime Stage**: Nginx Alpine
Final size: ~30-40MB

### nginx.conf
Features:
- SPA routing (React Router)
- API proxy (/api → backend)
- Security headers
- Gzip compression
- Browser caching (30 days)

## 🔗 Integration Points

### Backend API
```
Development:  http://localhost:3000/api/v1
Production:   https://api.example.com/api/v1
```

**Proxy in nginx.conf:**
```
location /api/ {
  proxy_pass http://api:3000;
}
```

### Docker Compose Network
Frontend communicates with backend via:
```
http://api:3000/api/v1
```

## 📈 Image Tagging Strategy

Tags applied automatically by GitHub Actions:

| Git Event | Tags |
|-----------|------|
| Push to main | `latest`, `main`, `sha-abc123` |
| Tag v1.2.3 | `v1.2.3`, `1.2`, `1`, `latest` |
| Pull Request | `pr-42` (not pushed) |

## ⚙️ Build Configuration

### Vite Config
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### npm Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🔐 Security

### Never Commit
- `.env` files with secrets
- Docker credentials
- API keys

### Always Use
- GitHub Secrets for CI/CD
- Environment variables for config
- `.dockerignore` for build context

## 📋 Checklist

### Initial Setup
- [ ] Clone repository
- [ ] Configure GitHub Secrets (`DOCKER_USERNAME`, `DOCKER_TOKEN`)
- [ ] Create Docker Hub repository `devops-project-frontend`
- [ ] Update this documentation if paths change

### Development
- [ ] `npm install` for dependencies
- [ ] `npm run dev` start development server
- [ ] Test API calls to backend
- [ ] Build locally: `npm run build`

### Docker Testing
- [ ] `docker build .` build locally
- [ ] `docker run` test container
- [ ] Verify health check: `curl http://localhost/health`
- [ ] Check Nginx logs: `docker logs <container>`

### Deployment
- [ ] Push code to main branch
- [ ] Verify GitHub Actions workflow runs
- [ ] Check image on Docker Hub
- [ ] Pull image: `docker pull spirittechrevolution/devops-project-frontend:latest`
- [ ] Run with docker-compose

## 🐛 Troubleshooting

See documentation files for detailed troubleshooting:
- [DOCKER_CONFIG.md](./DOCKER_CONFIG.md#troubleshooting)
- [GITHUB_CI_CD.md](./GITHUB_CI_CD.md#troubleshooting)

Quick fixes:
```bash
# Port in use?
docker run -p 8080:80 frontend

# Build failed?
docker build --no-cache .

# Logs?
docker logs <container-id>

# API not working?
docker exec frontend env | grep VITE_API_URL
```

## 📚 Documentation Map

```
project_devops_front/
├── README.md                          # Quick start & overview
├── DOCKER.md                          # Docker specifics
├── DOCKER_CONFIG.md                   # Detailed configuration
├── GITHUB_CI_CD.md                    # GitHub Actions setup
├── CONFIGURATION_SUMMARY.md           # This file
│
├── .github-workflows/
│   └── frontend-docker-build-push.yml # Workflow template reference
│
├── Dockerfile                         # Container image definition
├── nginx.conf                         # Nginx configuration
├── .env.example                       # Environment template
├── .dockerignore                      # Docker build exclusions
├── vite.config.js                     # Build tool config
├── package.json                       # Dependencies
│
└── src/                               # React source code
```

## 🔗 Related Documentation

- **Root README**: [../README.md](../README.md)
- **Full Docker Guide**: [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md)
- **GitHub Actions Guide**: [../GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md)
- **Secrets Setup**: [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md)

## 📞 Support

For issues:
1. Check relevant `.md` file in this directory
2. Review GitHub Actions logs in Actions tab
3. Check Docker logs: `docker logs <container>`
4. Consult root-level documentation

## Version Info

- **Frontend**: React 18.2.0, Vite 5.0.0
- **Container**: Nginx Alpine, Node 18 Alpine
- **Docker**: 20.10+
- **Updated**: March 2026
