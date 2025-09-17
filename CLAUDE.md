# Git Workflow Documentation

## Branch Structure
- **main**: Production branch (deploys to admin.hgraphene.com)
- **staging**: Testing branch (deploys to staging Railway)

## Development Workflow
1. Always work on main branch for regular development
2. Push changes to main: `git push origin main`  
3. For testing, merge to staging: `git checkout staging && git merge main && git push origin staging`
4. Deploy staging to test changes
5. If staging looks good, main will auto-deploy to production

## Important Rules
- NEVER create additional feature branches without documenting them here
- ALWAYS ensure local branches track remote: `git push -u origin <branch-name>`
- DELETE unused branches immediately to avoid confusion
- ALL commits must be pushed to GitHub - verify with `git status` and `git log --oneline origin/main..HEAD`

## Railway Deployments
- Production (main): admin.hgraphene.com
- Staging (staging): staging Railway environment

## Recovery Commands
```bash
# Check if commits are pushed
git log --oneline origin/main..HEAD

# Ensure branch tracks remote
git push -u origin main

# Clean up local branches
git branch -D <branch-name>

# Cherry-pick specific fixes between branches
git cherry-pick <commit-hash>

# Check what commits are in staging but not main
git log --oneline staging ^main
```

## Database Scripts
- `server/routes/seed-staging.js`: Seeds staging with JSON data
- `server/routes/data-import.js`: Imports SQL data to staging
- `scripts/railway-startup.sh`: Production startup script