# Frontend Configuration Index

Central reference for all frontend configuration, documentation, and CI/CD setup.

## 📖 Documentation Files

Quick navigation to all frontend documentation:

### Getting Started
- **[README.md](./README.md)** - Start here! Project overview and quick start guide
- **[CONFIGURATION_SUMMARY.md](./CONFIGURATION_SUMMARY.md)** - Quick reference of all configurations

### Docker & Containerization
- **[DOCKER.md](./DOCKER.md)** - Docker-specific documentation for the frontend
- **[DOCKER_CONFIG.md](./DOCKER_CONFIG.md)** - Detailed Docker configuration and troubleshooting
  - Build process
  - Dockerfile structure
  - Nginx configuration
  - Health checks
  - Performance optimization

### CI/CD & GitHub Actions
- **[GITHUB_CI_CD.md](./GITHUB_CI_CD.md)** - Complete GitHub Actions workflow documentation
  - Workflow triggers
  - Image tagging strategy
  - Setup prerequisites
  - Troubleshooting CI/CD

## 🐳 Docker Files

### Dockerfile
```bash
# Location: ./Dockerfile
# Purpose: Multi-stage build for production image
# Build stages:
#   1. Node 18 Alpine (builder)
#   2. Nginx Alpine (runtime)
# Final size: ~30-40MB
```

**Key features:**
- Multi-stage build (90% size reduction)
- Alpine Linux for small footprint
- Security headers
- Gzip compression
- Health check endpoint
- SPA routing support

### nginx.conf
```bash
# Location: ./nginx.conf
# Purpose: Nginx web server configuration
# Features:
#   - SPA routing (try_files for React Router)
#   - API proxy to backend (/api -> http://api:3000)
#   - Security headers
#   - Gzip compression
#   - Browser cache headers
```

**Customization points:**
- Server name/domain
- API proxy target
- Cache durations
- Security headers

## 🔄 GitHub Actions Configuration

### Active Workflow
```
Location: .github/workflows/frontend-docker-build-push.yml (root level)

Triggers:
  - Push to main branch
  - Create version tags (v1.0.0, etc.)
  - Pull requests (build only, no push)

Actions:
  1. Builds Docker image
  2. Uses GitHub caching
  3. Logs into Docker Hub (if not PR)
  4. Pushes image with semantic tags
```

### Workflow File Template
```
Location: .github-workflows/frontend-docker-build-push.yml

This is a reference copy of the workflow.
The actual active workflow is at: .github/workflows/frontend-docker-build-push.yml
```

## 🛠️ Configuration Files

### .env.example
Environment variables template for development:
```
VITE_API_URL=http://localhost:3000/api/v1
```

### .dockerignore
Files excluded from Docker build:
- node_modules/ (rebuilt in container)
- .git/ (version control)
- .env.local (secrets)
- dist/ (rebuilt)

### vite.config.js
Build tool configuration:
- Dev server proxy
- Build optimization
- Port configuration (5173)

### package.json
Node.js dependencies:
- react (18.2.0)
- react-router-dom (7.13.2)
- axios (1.6.0)
- vite (5.0.0)

## 📋 Project Structure

```
project_devops_front/
│
├── 📄 Documentation
│   ├── README.md                      # Quick start & overview
│   ├── CONFIGURATION_SUMMARY.md       # Quick reference
│   ├── CONFIG_INDEX.md                # This file
│   ├── DOCKER.md                      # Docker guide
│   ├── DOCKER_CONFIG.md               # Docker details
│   └── GITHUB_CI_CD.md               # CI/CD guide
│
├── 🐳 Docker Configuration
│   ├── Dockerfile                     # Container image definition
│   ├── nginx.conf                     # Web server config
│   └── .dockerignore                  # Build exclusions
│
├── ⚙️ Build Configuration
│   ├── vite.config.js                 # Vite settings
│   ├── package.json                   # Dependencies
│   ├── package-lock.json              # Locked versions
│   └── .env.example                   # Env template
│
├── 🔄 CI/CD Configuration
│   └── .github-workflows/
│       └── frontend-docker-build-push.yml  # Workflow template
│
├── 📦 Source Code
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API services
│   │   ├── styles/                    # CSS files
│   │   ├── context/                   # React Context
│   │   ├── App.jsx                    # Root component
│   │   └── main.jsx                   # Entry point
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   └── .gitignore                     # Git exclusions
│
└── 👤 Other
    └── .github-workflows/              # Reference workflows (docs only)
        └── frontend-docker-build-push.yml
```

## 🚀 Quick Start Checklist

### 1. Local Development
```bash
npm install
npm run dev
# Access: http://localhost:5173
```

### 2. Docker Testing
```bash
docker build -t frontend:latest .
docker run -p 5173:80 frontend:latest
# Access: http://localhost:5173
```

### 3. Docker Compose (from backend folder)
```bash
cd ../projet-devops
docker-compose up -d
# Frontend: http://localhost:5173
```

### 4. Deploy to Docker Hub
```bash
docker tag frontend:latest spirittechrevolution/devops-project-frontend:latest
docker push spirittechrevolution/devops-project-frontend:latest

# Or let GitHub Actions do it:
git push origin main  # Auto-builds and pushes
```

## 🔗 Cross-References

### In This Directory
- See [DOCKER.md](./DOCKER.md) for Docker specifics
- See [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) for advanced configuration
- See [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) for CI/CD setup

### In Root Directory
- [../README.md](../README.md) - Full project documentation
- [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md) - Complete Docker guide
- [../GITHUB_ACTIONS.md](../GITHUB_ACTIONS.md) - GitHub Actions guide
- [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md) - Secrets setup
- [../DOCKER_BUILD.md](../DOCKER_BUILD.md) - Build and deployment guide

### In Backend Directory
- [../projet-devops/README.md](../projet-devops/README.md)
- [../projet-devops/DOCKER.md](../projet-devops/DOCKER.md)
- [../projet-devops/.github/workflows/](../projet-devops/.github/workflows/)

## 📚 Reading Order

For different use cases:

### I want to develop locally
1. [README.md](./README.md) - Quick start
2. [vite.config.js](./vite.config.js) - Dev configuration

### I want to build Docker images
1. [DOCKER.md](./DOCKER.md) - Overview
2. [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) - Details
3. [Dockerfile](./Dockerfile) - Implementation

### I want to set up CI/CD
1. [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) - Setup guide
2. [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md) - Secrets
3. [.github-workflows/](../.github-workflows/) - Templates

### I want to deploy to production
1. [CONFIGURATION_SUMMARY.md](./CONFIGURATION_SUMMARY.md) - Overview
2. [../DOCKER_COMPLETE.md](../DOCKER_COMPLETE.md) - Full Docker guide
3. [../README.md](../README.md) - Deployment section

## 🔐 Key Configuration Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DOCKER_USERNAME` | Docker Hub auth | `spirittechrevolution` |
| `DOCKER_TOKEN` | Docker Hub token | (stored in GitHub Secrets) |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api/v1` |
| `REGISTRY` | Docker registry | `docker.io` |
| `IMAGE_NAME` | Image name | `spirittechrevolution/devops-project-frontend` |

## ✅ Verification Checklist

### Before Committing
- [ ] Run `npm run build` succeeds
- [ ] Dockerfile builds locally: `docker build .`
- [ ] `.env.example` is up to date
- [ ] Documentation updated

### Before Pushing to Main
- [ ] All tests pass (if any)
- [ ] Docker image builds on CI/CD
- [ ] GitHub Actions secrets configured
- [ ] Docker Hub repository exists

### After Merging to Main
- [ ] GitHub Actions workflow triggered
- [ ] Build succeeds in Actions tab
- [ ] Image pushed to Docker Hub
- [ ] New tags available in Docker Hub

## 🆘 Getting Help

1. **Development Issues**: Check [README.md](./README.md) troubleshooting
2. **Docker Issues**: Check [DOCKER_CONFIG.md](./DOCKER_CONFIG.md) troubleshooting
3. **CI/CD Issues**: Check [GITHUB_CI_CD.md](./GITHUB_CI_CD.md) troubleshooting
4. **Setup Issues**: Check [../GITHUB_SECRETS_SETUP.md](../GITHUB_SECRETS_SETUP.md)
5. **General Help**: Check [../README.md](../README.md)

## 📊 File Statistics

| Category | Count | Files |
|----------|-------|-------|
| Documentation | 6 | .md files |
| Docker Config | 3 | Dockerfile, nginx.conf, .dockerignore |
| Build Config | 5 | vite.config.js, package.json, .env.example, etc |
| CI/CD | 1 | .github-workflows (templates) |
| Source Code | Multiple | src/ directory |

## 🔄 Update History

| Date | Change |
|------|--------|
| March 24, 2026 | Initial configuration setup |
| | Created Docker configuration |
| | Set up GitHub Actions CI/CD |
| | Created documentation |

---

**Last Updated**: March 24, 2026
**Maintained by**: spirittechrevolution
**Status**: Production Ready ✅
