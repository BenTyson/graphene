# Deploy to Production

Deploy tested changes from staging to production at admin.hgraphene.com.

## ⚠️ CRITICAL WARNINGS

- **NEVER deploy to production without staging testing!**
- **This goes live immediately** at admin.hgraphene.com
- **Create database backup first** if schema changes were made
- **Notify stakeholders** if this is a major update

## Pre-Production Checklist

**MANDATORY - DO NOT SKIP:**

1. **Staging Testing Complete**
   - [ ] All features tested in staging environment
   - [ ] No errors in staging
   - [ ] File uploads work (Cloudinary)
   - [ ] PDF viewing works
   - [ ] Authentication tested
   - [ ] Database operations verified
   - [ ] Performance acceptable
   - [ ] Stakeholders reviewed (if required)

2. **Database Safety**
   - [ ] Database backup created: `npm run backup:create "pre-production-deploy"`
   - [ ] Schema changes tested in staging
   - [ ] No data loss risks identified

3. **Code Quality**
   - [ ] No console errors
   - [ ] No breaking changes for existing users
   - [ ] All tests passing (if applicable)

## Production Deployment Steps

### 1. Final Verification

```bash
# Verify you're on staging branch with latest changes
git checkout staging
git pull origin staging

# Check what will be merged to main
git log --oneline staging ^main
```

**STOP AND REVIEW**: Are these the correct commits to deploy?

### 2. Switch to Main Branch

```bash
git checkout main
git pull origin main
```

### 3. Merge Staging into Main

```bash
git merge staging
```

**If merge conflicts occur:**
- Resolve conflicts carefully
- Test locally after resolving
- Get approval before proceeding

### 4. Verify Merge

```bash
git status
# Should show clean working tree

git log --oneline -5
# Verify commits look correct
```

### 5. Push to Production

```bash
git push origin main
```

**⚠️ DEPLOYMENT STARTS NOW** - Railway will automatically deploy to admin.hgraphene.com

### 6. Monitor Production Deployment

1. **Watch Railway Logs** (first 10-15 minutes critical)
   ```bash
   railway logs
   ```

2. **Check Production Site**
   - Visit https://admin.hgraphene.com
   - Verify application loads
   - Test critical features
   - Check for errors

3. **Monitor for Issues**
   - Watch for user reports
   - Check error logs
   - Verify database operations

### 7. Post-Deployment Verification

**Test in Production:**
- [ ] Application loads successfully
- [ ] Login works
- [ ] Core features operational
- [ ] No console errors
- [ ] Database queries working
- [ ] File uploads functional

## Rollback Procedures

### Quick Rollback (If Issues Detected)

**Option 1: Revert Last Commit**
```bash
git checkout main
git revert HEAD
git push origin main
```

**Option 2: Force Rollback to Previous Version**
```bash
# Find last known good commit
git log --oneline main

# Reset to that commit (CAUTION!)
git checkout main
git reset --hard <commit-hash>
git push --force origin main
```

**Option 3: Railway Dashboard Rollback**
1. Go to Railway dashboard
2. Select production service
3. Click "Deployments"
4. Click "Redeploy" on previous successful deployment

### Database Rollback (If Schema Changes)

```bash
# Restore from backup
psql $PRODUCTION_DATABASE_URL < backups/last-good-backup.sql
```

## Post-Deployment Tasks

After successful deployment:

1. **Sync Staging with Main** (keep branches aligned)
   ```bash
   git checkout staging
   git merge main
   git push origin staging
   ```

2. **Verify Sync**
   ```bash
   git log --oneline staging ^main
   # Should show no commits (branches synced)
   ```

3. **Document Deployment**
   - Note deployment time
   - Record any issues encountered
   - Update stakeholders if needed

## Emergency Contacts

**If production deployment fails:**
1. Check Railway logs immediately
2. Rollback if critical errors
3. Review deployment guide: `/docs/workflows/DEPLOYMENT.md`
4. Check troubleshooting guide: `/docs/workflows/TROUBLESHOOTING.md`

## Important Notes

- **Railway auto-deploys** on push to main branch
- **No manual trigger needed** - push triggers deployment
- **HTTPS automatic** - Railway handles SSL
- **Deployment time**: Usually 2-4 minutes
- **Zero-downtime**: Railway handles gracefully

## Safety Reminders

- ✅ **ALWAYS test in staging first**
- ✅ **ALWAYS create database backup**
- ✅ **ALWAYS monitor logs after deployment**
- ❌ **NEVER force push to main** (except emergency rollback)
- ❌ **NEVER skip staging testing**
- ❌ **NEVER deploy during peak usage** (if avoidable)

**When in doubt, wait and review. Production deployments can always wait for proper testing.**

For complete deployment documentation, see: `/docs/workflows/DEPLOYMENT.md`
