# Frontend GitHub Actions CI/CD Configuration

This directory contains documentation and configuration for the frontend's GitHub Actions CI/CD pipeline.

## Overview

The frontend application is automatically built and pushed to Docker Hub whenever changes are pushed to the main branch or when version tags are created.

## Workflow Configuration

**Active Workflow**: `.github/workflows/frontend-docker-build-push.yml` (root level)

This workflow:
- ✅ Builds the frontend Docker image (multi-stage: Node builder + Nginx)
- ✅ Pushes to Docker Hub on main branch pushes
- ✅ Builds AND pushes on version tag creation (v1.0.0, etc.)
- ✅ Only builds (no push) on pull requests
- ✅ Uses GitHub Actions cache for faster builds
- ✅ Automatically tags images with semantic versioning

## Image Details

| Property | Value |
|----------|-------|
| **Image Name** | `spirittechrevolution/devops-project-frontend` |
| **Registry** | Docker Hub (`docker.io`) |
| **Base Image** | `nginx:alpine` (production) |
| **Build Time** | ~3-5 minutes |
| **Image Size** | ~30-40MB |
| **Docker Hub URL** | https://hub.docker.com/r/spirittechrevolution/devops-project-frontend |

## Trigger Events

### Automatic Build & Push

Workflow runs and **pushes to Docker Hub** when:
- Code is pushed to `main` branch
- Version tag is created: `git tag v1.0.0`

### Build Only (No Push)

Workflow runs but **does NOT push** when:
- Pull request is opened against main
- Other branches are pushed (not main)

## Git Triggers for Frontend

The frontend workflow only triggers on:

```yaml
paths:
  - 'project_devops_front/**'        # Frontend changes
  - '.github/workflows/frontend-*'  # Frontend workflow changes
```

This prevents unnecessary builds when only backend code changes.

## Image Tagging Strategy

Images are automatically tagged based on git events:

### Push to Main
```
Tags:
  - latest
  - main
  - sha-abc1234
```

### Create Version Tag (git tag v1.2.3)
```
Tags:
  - v1.2.3
  - 1.2
  - 1
  - latest
  - sha-abc1234
```

### Pull Request
```
Tags:
  - pr-42
  - sha-abc1234

Note: NOT pushed to Docker Hub, only built
```

## Prerequisites

### 1. Docker Hub Setup

Create Docker Hub repositories:

**Backend Repository**
- Name: `devops-project`
- Description: Backend API container
- Visibility: Public

**Frontend Repository**
- Name: `devops-project-frontend`
- Description: Frontend React/Vite container
- Visibility: Public

Access: https://hub.docker.com/orgs/spirittechrevolution

### 2. GitHub Secrets

Set in: **Repository Settings → Secrets and variables → Actions**

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token (NOT password) |

**Generate Docker Hub Token**:
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: `github-actions`
4. Permissions: Read & Write
5. Copy token to GitHub Secret as `DOCKER_TOKEN`

## Environment Variables

### Build-Time (Vite Build)

Frontend build uses these variables (if needed):

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

### Runtime (Nginx)

Frontend container uses these variables:

```bash
VITE_API_URL=https://api.example.com/api/v1  # In production
```

## Dockerfile Details

**Location**: `project_devops_front/Dockerfile`

**Multi-stage Build**:

```
Stage 1: Node 18 Alpine (Builder)
├── npm ci (install dependencies)
└── npm run build (create dist/)

Stage 2: Nginx Alpine (Runtime)
├── Copy dist/ from builder
├── Configure Nginx
├── Health check endpoint
└── Expose port 80
```

**Features**:
- Multi-stage reduces final image size by ~90%
- Alpine Linux for minimal footprint
- Non-root user support
- Health check for orchestration
- Automatic SPA routing

## Workflow Execution

### Step-by-Step Process

1. **Checkout Code**
   - Clones repository at current commit

2. **Setup Docker Buildx**
   - Enables advanced Docker build features
   - Supports multi-platform builds

3. **Login to Docker Hub** (if not PR)
   - Uses `DOCKER_USERNAME` and `DOCKER_TOKEN` secrets
   - Only on pushes to main or tags

4. **Extract Metadata**
   - Generates tags based on git event
   - Creates labels with build info

5. **Build & Push**
   - Builds Docker image
   - Uses GitHub Actions cache layer
   - Pushes to Docker Hub (if not PR)

6. **Success Notification**
   - Prints confirmation message
   - Image available on Docker Hub

### Typical Build Duration

- **First Run**: ~5-7 minutes (builds cache)
- **Subsequent Runs**: ~3-4 minutes (uses cache)
- **CI/CD Overhead**: ~1 minute

## Monitoring Builds

### View Workflow Runs

1. Go to repository → **Actions** tab
2. Select **"Build and Push Frontend to Docker Hub"** workflow
3. Click a run to see details
4. Expand "Build and push Frontend Docker image" step to see logs

### View on Docker Hub

1. Go to https://hub.docker.com/r/spirittechrevolution/devops-project-frontend
2. Click **Tags** tab
3. See all available versions
4. Latest tag should match your recent main push

### Command Line

```bash
# View workflow runs
gh run list --workflow=frontend-docker-build-push.yml

# View specific run
gh run view <run-id> --log
```

## Troubleshooting

### Build Fails with "No matching Dockerfile"

**Error**: `COPY failed: stat ... no such file`

**Solution**:
- Verify Dockerfile exists at: `project_devops_front/Dockerfile`
- Verify path in workflow: `file: ./project_devops_front/Dockerfile`
- CI runs from repo root, not from frontend directory

### "Denied: insufficient_data" on Push

**Error**: Authentication fails when pushing to Docker Hub

**Solution**:
1. Verify `DOCKER_USERNAME` is correct (case-sensitive)
2. Verify `DOCKER_TOKEN` is access token (not password)
3. Regenerate token: https://hub.docker.com/settings/security
4. Update GitHub Secret: Settings → Secrets → DOCKER_TOKEN

### Image Built But Not Pushed

**Reason**: Pull Request event (intentional)

**Behavior**:
- PR builds are tested without pushing
- Only main branch pushes trigger Docker Hub push
- This prevents accidental image overwrites

**Verify**:
- Check event type: "push" vs "pull_request"
- Look at step: "if: github.event_name != 'pull_request'"

### Timeout During Build

**Error**: Build takes longer than timeout (usually 6 hours)

**Solution**:
- GitHub Actions free tier has 6-hour job limit
- Large builds may exceed this
- Configure timeout in workflow: `timeout-minutes: 30`

### Cache Not Working

**Symptom**: Each build takes full time (not faster)

**Solution**:
- Cache requires successful build history
- First build is slow, subsequent are faster
- Cache persists for 7 days of inactivity
- Manual cache clear in Settings → Actions

## Best Practices

### 1. Keep Secrets Secure

```bash
# ✅ Good - Use GitHub Secrets
docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_TOKEN }}

# ❌ Bad - Never hardcode
docker login -u spirittechrevolution -p abc123secret
```

### 2. Use Semantic Versioning for Tags

```bash
# Create version tag
git tag v1.0.0
git push origin v1.0.0

# This automatically:
# - Triggers workflow
# - Tags image as v1.0.0, 1.0, 1, latest
```

### 3. Test PR Before Merge

- PR triggers build (no push)
- Review build logs for errors
- Merge only if build succeeds

### 4. Monitor Image Size

Target image size: 30-50MB

```bash
# Check locally
docker build -t frontend:test .
docker images frontend:test

# If > 100MB, review Dockerfile for:
# - Unused dependencies
# - Large node_modules
# - Missing .dockerignore
```

### 5. Automatic Cleanup

GitHub Actions automatically:
- Removes old cache (7+ days inactive)
- Cleans up failed builds
- No manual cleanup needed

## Advanced Configuration

### Multi-Platform Builds

To build for ARM64 and AMD64:

```yaml
platforms: linux/amd64,linux/arm64
```

Note: Requires QEMU or buildx setup.

### Custom Build Arguments

Pass variables during build:

```yaml
build-args: |
  BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
  VCS_REF=${{ github.sha }}
```

### Push to Multiple Registries

Login to multiple registries and push to all:

```yaml
- name: Log in to Custom Registry
  uses: docker/login-action@v2
  with:
    registry: registry.example.com
```

## Integration with Other Workflows

### Backend Workflow (`docker-build-push.yml`)

- Builds backend separately
- Runs independently of frontend
- Both can trigger simultaneously

### Full Stack Workflow (`docker-build-push-all.yml`)

- Builds backend AND frontend in parallel
- Useful for coordinated releases
- Waits for both to succeed before notifying

## References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Buildx](https://docs.docker.com/build/architecture/)
- [Docker Hub API](https://docs.docker.com/docker-hub/api/latest/)
- [Semantic Versioning](https://semver.org/)

## Support

For issues:
1. Check workflow logs in Actions tab
2. Review this troubleshooting section
3. Check Docker Hub repository status
4. Review GitHub Status page: https://www.githubstatus.com
