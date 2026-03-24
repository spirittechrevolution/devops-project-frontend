# Frontend Docker Configuration

This file documents the Docker-specific configuration for the frontend.

## Quick Reference

### Build

```bash
# Build locally
docker build -t devops-project-frontend:latest .

# Build with tag
docker build -t spirittechrevolution/devops-project-frontend:v1.0.0 .
```

### Run

```bash
# Development
docker run -p 5173:80 devops-project-frontend:latest

# Production
docker run -d \
  --name frontend \
  -p 80:80 \
  -e VITE_API_URL=https://api.example.com/api/v1 \
  spirittechrevolution/devops-project-frontend:latest
```

### Push to Docker Hub

```bash
# Login
docker login

# Push
docker push spirittechrevolution/devops-project-frontend:v1.0.0
docker push spirittechrevolution/devops-project-frontend:latest
```

## Dockerfile Overview

**Location**: `./Dockerfile`

### Build Layers

```
Layer 1: Node Builder (node:18-alpine)
├── npm ci (locked dependencies)
├── Copy source code
└── npm run build → dist/

Layer 2: Nginx Runtime (nginx:alpine)
├── Remove default nginx config
├── Add custom nginx.conf
├── Copy dist/ from builder
├── Add health check
└── Start: nginx daemon off
```

### Size Analysis

| Image | Size | Note |
|-------|------|------|
| node:18-alpine | 170MB | Build stage |
| Final image | 30-40MB | After multi-stage |
| Size reduction | 80-82% | Massive savings |

## Nginx Configuration

**Location**: `./nginx.conf`

### Features

- SPA routing (`try_files $uri /index.html`)
- API proxy (`/api/* → http://api:3000`)
- Security headers (CSP, X-Frame-Options, etc.)
- Gzip compression (text assets)
- Browser caching (30 days for static files)
- Health check endpoint (`/health`)

### Customization

Edit `nginx.conf` to modify:
- Server name/hostname
- API proxy target
- Security headers
- Cache headers
- Additional routes

## Environment Configuration

### Build-Time (Vite)

Variables used during `npm run build`:

**From `.env` or Docker build args:**
```
VITE_API_URL=http://localhost:3000/api/v1
```

### Runtime (Container)

Container environment variables (if needed):

```bash
docker run -e VITE_API_URL=https://api.example.com/api/v1 frontend
```

**Note**: Vite environment is embedded at build time, not changeable at runtime.

For runtime API URL changes, update nginx.conf API proxy instead.

## .dockerignore

**File**: `./.dockerignore`

Excludes from Docker build:

```
node_modules/          # Don't copy, build fresh
npm-debug.log          # Build artifacts
dist/                  # Will be rebuilt
.git/                  # Version control
.gitignore             # Git config
.env.local             # Secrets
```

This keeps build context small and fast.

## GitHub Actions Integration

**Workflow**: `.github/workflows/frontend-docker-build-push.yml`

### Automation

GitHub Actions:
1. Watches for changes on `main` branch
2. Watches for version tags (`v*`)
3. Automatically builds image
4. Pushes to Docker Hub (main/tags only)
5. Skips push on PR (security)

### Manual Trigger

To manually trigger build from GitHub UI:

1. Go to Actions tab
2. Select "Build and Push Frontend to Docker Hub"
3. Click "Run workflow" → Select branch
4. Choose whether to push (requires API key, skipped once run starts)

## Network Configuration

### Docker Compose (Development)

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

**Container Communication:**
- Frontend → API: `http://api:3000/api/v1`
- Frontend URL: `http://localhost:5173`

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

**Note**: In production, API URL comes from environment, Nginx proxy handles routing.

## Health Check

### Endpoint

```
GET /health
```

**Response:**
```
HTTP/1.1 200 OK
Content-Type: text/plain

healthy
```

### Docker Health Check

Container includes:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

**Status**:
```bash
docker inspect frontend --format='{{.State.Health.Status}}'
# Output: healthy / unhealthy / none
```

## Volume Mounts

### Development

Mount source code for hot reload:

```bash
docker run -v $(pwd)/src:/usr/share/nginx/html/src frontend
```

**Note:** Requires special Nginx config for hot reload (not in standard config).

### Production

No volume mounts recommended. Image contains everything needed.

```bash
docker run -d frontend
# Image is self-contained
```

## Port Mapping

### Standard Configuration

| Internal | External | Purpose |
|----------|----------|---------|
| 80 | 5173 (dev) / 80 (prod) | HTTP traffic |

### Custom Ports

Set via Docker or docker-compose:

```yaml
ports:
  - "8080:80"  # Access on port 8080
```

## Logs

### Docker Logs

```bash
# View logs
docker logs frontend

# Follow logs (streaming)
docker logs -f frontend

# Last 100 lines with timestamps
docker logs --timestamps -n 100 frontend
```

### Log Location (Inside Container)

Nginx logs: `/var/log/nginx/access.log` and `error.log`

**To view inside container:**
```bash
docker exec frontend tail -f /var/log/nginx/access.log
```

## Performance Tuning

### Build Performance

**Caching Strategy:**
- Separate dependency layer (npm ci)
- Often layer doesn't change, builds faster
- Subsequent builds: ~3-4 minutes

**Optimization:**
```dockerfile
# Good - copies only package files first
COPY package*.json ./
RUN npm ci

# Bad - copies everything first
COPY . .
RUN npm ci
```

### Runtime Performance

**Nginx Tuning:**
- Gzip enabled (reduces transfer by 60-80%)
- Browser cache 30 days (reduces requests)
- Keep-alive enabled
- Minimal header overhead

**Metrics:**
- Page load: ~500ms-1s
- Image transfer: ~100-200KB (gzipped)
- Static assets: Served from browser cache

## Troubleshooting

### Image Won't Build

**Error**: `ERR! code ERESOLVE`

**Cause**: Dependency conflict in npm

**Solution**:
1. Check Node version matches
2. Update package-lock.json: `npm install`
3. Use `npm ci --legacy-peer-deps` if needed

### Container Won't Start

**Error**: `nginx: [emerg] bind() to 0.0.0.0:80 failed`

**Cause**: Port 80 already in use

**Solution**:
- Use different port: `-p 8080:80`
- Or stop conflicting container: `docker stop <name>`

### API Calls Fail from Frontend

**Error**: `Failed to fetch` or CORS error

**Cause**: Wrong VITE_API_URL

**Solution**:
1. Verify `VITE_API_URL` environment variable
2. Api must be accessible at URL specified
3. Check Nginx proxy config in `nginx.conf`

### Slow Build Times

**Symptom**: Build takes > 10 minutes

**Causes:**
- First build (no cache)
- Large node_modules
- Network issues downloading packages

**Solutions**:
- Run subsequent builds (use cache)
- Check machine resources
- Increase Docker memory: Settings → Resources

## Security

### Permissions

Container runs as:
- **User**: `root` (Nginx requirement)
- **Group**: `root`

**Note**: Nginx itself doesn't run privileged, but container needs root for port 80 binding.

### Secrets

❌ Never include in image:
- `.env` files
- API keys
- Passwords

✅ Use at runtime:
- Environment variables
- Mounted secrets
- Configuration files

### Base Image Security

Regular updates:
- `node:18-alpine` - Updated regularly
- `nginx:alpine` - Updated regularly

**Check for vulnerabilities:**
```bash
docker scan spirittechrevolution/devops-project-frontend
```

## Maintenance

### Updating Base Images

```bash
# Check for updates
docker pull nginx:alpine
docker pull node:18-alpine

# Rebuild to get latest base
docker build --no-cache .
```

### Removing Old Images

```bash
# Remove specific image
docker rmi spirittechrevolution/devops-project-frontend:old-tag

# Remove dangling images
docker image prune

# Remove unused images
docker image prune -a
```

## References

- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/ngx_core_module.html)
- [Node.js Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Alpine Linux](https://www.alpinelinux.org/)
