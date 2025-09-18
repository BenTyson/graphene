# Git Workflow Documentation

## Branch Structure
- **main**: Production branch (deploys to admin.hgraphene.com)
- **staging**: Testing branch (deploys to staging Railway)

## Development Workflow
1. Always work on staging branch for regular development
2. Push changes to staging: `git push origin staging`  
3. Deploy staging to Railway for testing
4. If staging looks good, merge to main for production: `git checkout main && git merge staging && git push origin main`
5. Main auto-deploys to production

## Important Rules
- NEVER create additional feature branches without documenting them here
- ALWAYS ensure local branches track remote: `git push -u origin <branch-name>`
- DELETE unused branches immediately to avoid confusion
- ALL commits must be pushed to GitHub - verify with `git status` and `git log --oneline origin/main..HEAD`
- NEVER allow main and staging to diverge - keep them synchronized
- If cherry-picking between branches, immediately merge to prevent branch confusion
- ALWAYS verify branch state before starting work: `git status` and `git log --oneline --graph --all`

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

# Check what commits are in main but not staging
git log --oneline main ^staging

# Sync staging with main (recommended after any main changes)
git checkout staging && git merge main && git push origin staging
```

## Branch Synchronization Protocol
After any direct commits to staging or cherry-picking operations:
1. When ready for production, sync main: `git checkout main && git merge staging`
2. Resolve any merge conflicts
3. Push both branches: `git push origin staging && git push origin main`
4. Verify sync: `git log --oneline staging ^main` (should be empty after production merge)

## Database Scripts
- `server/routes/seed-staging.js`: Seeds staging with JSON data
- `server/routes/data-import.js`: Imports SQL data to staging
- `scripts/railway-startup.sh`: Production startup script