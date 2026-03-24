# Frontend Docker Documentation

## Overview

The frontend application is containerized using a multi-stage Docker build for optimal size and performance.

### Build Stages
1. **Builder Stage**: Node.js 18 Alpine - builds the React app with Vite
2. **Production Stage**: Nginx Alpine - serves the built static files

## Architecture

```
Frontend Container (Nginx)
    ├── Port 80 (HTTP)
    ├── SPA Routing (try_files)
    ├── API Proxy (/api/* -> API Container)
    └── Security Headers & Caching
```

## Building

### Local Development

```bash
# Build the frontend image
docker build -t projet_devops_frontend:latest .

# Or from the root directory
docker build -f project_devops_front/Dockerfile -t projet_devops_frontend:latest project_devops_front/
```

### Production Image

```bash
# Build and tag for Docker Hub
docker build -t spirittechrevolution/devops-project-frontend:latest .

# Push to Docker Hub
docker push spirittechrevolution/devops-project-frontend:latest
```

## Docker Compose

### Development

```bash
# Start all services including frontend
cd projet-devops
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down
```

The frontend will be available at:
- **Local**: http://localhost:5173
- **Via API Proxy**: http://localhost:5173/api/v1/*

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Configuration via `.env` file:
```
FRONTEND_PORT=80
VITE_API_URL=https://api.example.com/api/v1
```

## Features

### Nginx Configuration
- **Gzip Compression**: Enabled for text assets
- **Caching Strategy**: 
  - Static assets (30 days cache)
  - Index.html (no cache for SPA updates)
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **SPA Routing**: All requests to `/` except API calls
- **API Proxy**: Routes `/api/*` to backend API container
- **Health Check**: `/health` endpoint for orchestration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Backend API URL |

## Network

Both containers communicate on the same Docker network:
- **Network Name**: `projet_devops_network` (dev) / `projet_devops_network_prod` (prod)
- **Frontend Container Name**: `projet_devops_frontend` (dev) / `projet_devops_frontend_prod` (prod)
- **API Hostname**: `api` (dev) / `api` (prod)

## Health Check

The frontend container includes a health check:
- **Endpoint**: `http://localhost/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 10 seconds

## Troubleshooting

### Frontend returns 404 for routes
This is expected behavior - Nginx is configured to serve `index.html` for all routes (SPA routing).

### API calls fail from frontend
Ensure the `VITE_API_URL` environment variable is correctly set and the API container is healthy.

### Static assets not loading
Check the Nginx configuration and ensure the `/usr/share/nginx/html` directory contains the built files.

### Large image size
Ensure you're using the multi-stage build which only includes Nginx in the final image, not Node.js.

## Monitoring

View container stats:
```bash
docker-compose stats frontend
```

View real-time logs:
```bash
docker-compose logs -f frontend
```

## Performance Optimization

- **Multi-stage build**: Reduces final image size (~30-40MB vs 300-500MB with Node)
- **Nginx caching**: Browser caching for static assets (30 days)
- **Gzip compression**: Reduces transfer size
- **Alpine Linux**: Lightweight base images

## Image Information

**Development Image**
- Size: ~30-40MB
- Base: `nginx:alpine`
- Requirements: Docker, Docker Compose

**Production Image**  
- Repository: `spirittechrevolution/devops-project-frontend`
- Tag: `latest`
- Available on: Docker Hub
