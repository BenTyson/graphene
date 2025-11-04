# Deployment Guide

**⚠️ CRITICAL: ALWAYS DEPLOY TO STAGING FIRST!**

This guide covers the complete deployment workflow for the Graphene Production Control System.

---

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Branch Strategy](#branch-strategy)
3. [Deployment Flow](#deployment-flow)
4. [Railway Configuration](#railway-configuration)
5. [Database Management](#database-management)
6. [Environment Variables](#environment-variables)
7. [Testing Checklist](#testing-checklist)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Environment Overview

The Graphene system uses a three-tier deployment strategy:

### 1. Local Development
- **URL**: `localhost:5174` (Vite dev server)
- **Database**: Local PostgreSQL instance
- **Cloudinary**: `graphene-uploads-dev` folder
- **Purpose**: Active development and testing

### 2. Staging (Railway)
- **URL**: Railway-generated staging URL
- **Database**: Separate staging PostgreSQL instance on Railway
- **Cloudinary**: `graphene-uploads-staging` folder
- **Branch**: `staging`
- **Purpose**: **MANDATORY pre-production testing** - Test ALL changes here first!

### 3. Production (Railway)
- **URL**: `admin.hgraphene.com` (custom domain)
- **Database**: Production PostgreSQL instance on Railway
- **Cloudinary**: `graphene-uploads` folder
- **Branch**: `main`
- **Purpose**: Live production environment

---

## Branch Strategy

### Active Branches

- **`staging`** - Testing and pre-production branch (deploy here first!)
- **`main`** - Production branch (only deploy after staging validation)

**⚠️ IMPORTANT RULES:**
- **NEVER deploy directly to main** without testing in staging first
- **NEVER create feature branches** without documenting them in [GIT-WORKFLOW.md](../session-start/GIT-WORKFLOW.md)
- **ALWAYS verify branch** before starting work: `git status`
- **ALWAYS keep staging and main synchronized** - never let them diverge

---

## Deployment Flow

```
Local Development → Staging (Test!) → Production
   (localhost)       (Railway)      (admin.hgraphene.com)
                   ← staging →    ← main →
```

### Step 1: Local Development

Work on your local machine first:

```bash
# Ensure you're on staging branch
git checkout staging
git pull origin staging

# Make your changes and test locally
npm run dev

# Test thoroughly in local environment
# - Verify all features work
# - Check for console errors
# - Test database operations
# - Test file uploads (if applicable)
```

### Step 2: Deploy to Staging (MANDATORY!)

**⚠️ THIS STEP IS REQUIRED - NEVER SKIP!**

```bash
# Commit your changes
git add .
git commit -m "feat: your feature description"

# Push to staging branch
git push origin staging
```

**Railway automatically deploys when you push to `staging` branch.**

**Staging Testing Checklist:**
- [ ] Application loads without errors
- [ ] All new features work correctly
- [ ] File uploads work (Cloudinary integration)
- [ ] PDF viewing works (if modified)
- [ ] Authentication works
- [ ] Database operations succeed
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Mobile/responsive views work (if applicable)

### Step 3: Deploy to Production (Only After Staging Success!)

**Only proceed after staging testing passes!**

```bash
# Switch to main branch
git checkout main
git pull origin main

# Merge staging into main
git merge staging

# Verify merge was clean (no conflicts)
git status

# Push to production
git push origin main
```

**Railway automatically deploys to production when you push to `main` branch.**

**Important:** The deployment goes live at `admin.hgraphene.com` immediately!

---

## Railway Configuration

### Setting Up Staging Environment

If staging environment doesn't exist yet:

1. **Create New Railway Service**
   - Log into Railway dashboard
   - Click "New Service" in your project
   - Select "GitHub Repo"
   - Choose your `graphene` repository
   - Select `staging` branch for deployment

2. **Add PostgreSQL Database**
   - Add PostgreSQL service to Railway project
   - Name it "graphene-staging-db"
   - Railway will auto-generate `DATABASE_URL`

3. **Configure Environment Variables** (see below)

4. **Set Custom Domain (Optional)**
   - Add custom domain: `staging.hgraphene.com`
   - Or use Railway's auto-generated URL
   - Railway handles SSL automatically

### Setting Up Production Environment

Same process as staging but:
- Select `main` branch for deployment
- Use production database
- Set custom domain: `admin.hgraphene.com`
- Use production environment variables

### Build Configuration

The project includes Railway configuration files:

**`railway.json`** - Deployment configuration
**`nixpacks.toml`** - Build settings
**`scripts/railway-startup.sh`** - Production startup script

Railway automatically:
1. Installs dependencies (`npm install`)
2. Generates Prisma client (`npx prisma generate`)
3. Pushes database schema (`npx prisma db push`)
4. Builds frontend (`npm run build`)
5. Starts server (`node server/index.js`)

---

## Database Management

### Local Database Setup

```bash
# Install PostgreSQL locally (if not already installed)
# macOS: brew install postgresql

# Create local database
createdb graphene_db

# Update .env file
DATABASE_URL="postgresql://localhost:5432/graphene_db"

# Apply schema
npx prisma generate
npx prisma db push

# (Optional) Seed initial data
npm run seed
```

### Staging Database Setup

Railway automatically creates and manages the database when you:
1. Add PostgreSQL service to Railway project
2. Railway sets `DATABASE_URL` environment variable
3. On deployment, startup script runs:
   - `npx prisma generate`
   - `npx prisma db push`
   - Creates initial users (if seed script exists)

### Production Database Setup

Same as staging, but with production database instance.

### Database Migrations

**Development (Local):**
```bash
# Make schema changes in prisma/schema.prisma
npx prisma db push     # Push schema changes
npx prisma generate    # Regenerate client
```

**Staging/Production (Railway):**
- Railway automatically runs `npx prisma db push` on deployment
- No manual migration required

### Database Backups

**Local Backups:**
```bash
# Create backup
npm run backup:create "description of current state"

# Backups saved to /backups/graphene_backup_YYYY-MM-DDTHH-MM-SS.sql
```

**Production Backups:**
- Railway provides automatic database backups
- Access via Railway dashboard → Database → Backups

**Manual Production Backup:**
```bash
# Export from production (use with caution!)
pg_dump $PRODUCTION_DATABASE_URL > prod-backup.sql

# Import to staging (for testing with production data)
psql $STAGING_DATABASE_URL < prod-backup.sql
```

### Data Seeding

**Staging Seed Scripts:**
- `server/routes/seed-staging.js` - Seeds staging with JSON data
- `server/routes/data-import.js` - Imports SQL data to staging

---

## Environment Variables

### Required Variables

Set these in Railway dashboard for each environment:

#### Staging Environment
```bash
NODE_ENV=staging
DATABASE_URL=<auto-generated-by-railway>
JWT_SECRET=<secure-random-string>
OPENAI_API_KEY=<your-openai-key>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
USE_CLOUDINARY=true
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt
```

#### Production Environment
```bash
NODE_ENV=production
DATABASE_URL=<auto-generated-by-railway>
JWT_SECRET=<secure-random-string>  # DIFFERENT from staging!
OPENAI_API_KEY=<your-openai-key>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
USE_CLOUDINARY=true
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt
```

#### Local Development (.env)
```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/graphene_db
JWT_SECRET=local-dev-secret
OPENAI_API_KEY=<your-openai-key>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
USE_CLOUDINARY=true
```

**⚠️ NEVER commit `.env` files to git!**

### Cloudinary Configuration

Each environment uses separate Cloudinary folders:

| Environment | Folder Name |
|------------|-------------|
| Development | `graphene-uploads-dev` |
| Staging | `graphene-uploads-staging` |
| Production | `graphene-uploads` |

**Important:** Ensure PDF delivery is enabled in Cloudinary settings for all folders.

---

## Testing Checklist

### Before Deploying to Staging

- [ ] All changes tested locally (`npm run dev`)
- [ ] No console errors in browser
- [ ] Database schema changes tested locally
- [ ] All tests passing (if applicable)
- [ ] Code reviewed (if working in team)

### Before Deploying to Production

**⚠️ MANDATORY STAGING VALIDATION:**

- [ ] Staging deployment successful
- [ ] All features work in staging environment
- [ ] File uploads work (Cloudinary integration)
- [ ] PDF viewing works correctly
- [ ] Authentication/login works
- [ ] Database operations successful
- [ ] No console errors in staging
- [ ] Performance acceptable
- [ ] Mobile views work (if applicable)
- [ ] No breaking changes for existing users
- [ ] Stakeholders reviewed changes (if required)

---

## Rollback Procedures

### Quick Rollback (Git Revert)

If production deployment has issues:

```bash
# Revert the last commit on main
git checkout main
git revert HEAD
git push origin main

# Railway will automatically redeploy the previous version
```

### Emergency Rollback (Force Previous Commit)

**⚠️ Use with extreme caution!**

```bash
# Find the last known good commit
git log --oneline main

# Reset to that commit
git checkout main
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback

If database schema changes caused issues:

1. **Stop the application** (if possible)
2. **Restore from backup:**
   ```bash
   psql $DATABASE_URL < backups/last-good-backup.sql
   ```
3. **Revert schema changes in code**
4. **Redeploy**

**Best Practice:** Always create a backup before schema changes!

### Railway Rollback

Railway provides deployment history:
1. Go to Railway dashboard
2. Select your service
3. Click "Deployments"
4. Click "Redeploy" on a previous successful deployment

---

## Troubleshooting

### Deployment Fails

**Check Railway logs:**
```bash
railway logs
```

**Common issues:**
- Missing environment variables → Check Railway dashboard
- Database connection fails → Verify `DATABASE_URL`
- Build fails → Check `package.json` scripts
- Startup script fails → Check `scripts/railway-startup.sh`

### Application Not Loading

1. Check Railway logs for errors
2. Verify environment variables are set
3. Check database connectivity
4. Verify custom domain DNS settings (if using)

### File Uploads Not Working

1. Verify Cloudinary environment variables
2. Check Cloudinary folder names match environment
3. Ensure PDF delivery enabled in Cloudinary settings
4. Check file size limits in environment variables

### Database Errors

1. Check `DATABASE_URL` is correct
2. Verify database is running (Railway dashboard)
3. Check if schema is up to date: `npx prisma db push`
4. Review database logs in Railway

### Authentication Issues

1. Verify `JWT_SECRET` is set
2. Check if users exist in database
3. Clear browser cookies/localStorage
4. Check CORS settings (if applicable)

---

## Monitoring and Maintenance

### Railway Dashboard Monitoring

- **Deployments**: View deployment history and status
- **Logs**: Real-time application logs
- **Metrics**: Resource usage, CPU, memory
- **Database**: Connection stats, query performance

### Health Checks

Check application health:
```bash
curl https://admin.hgraphene.com/api/health
```

### Performance Monitoring

- Monitor response times in Railway dashboard
- Check database query performance
- Review error rates
- Track resource usage

---

## Best Practices

### Deployment Best Practices

1. **Always test locally first** before pushing to staging
2. **Always deploy to staging** before production
3. **Never skip staging testing** - it exists for a reason!
4. **Create database backups** before major changes
5. **Deploy during low-traffic times** when possible
6. **Monitor logs after deployment** for 10-15 minutes
7. **Keep staging and main synchronized** - don't let them diverge

### Security Best Practices

1. **Never commit secrets** (`.env` files, API keys)
2. **Use different JWT secrets** for each environment
3. **Rotate API keys regularly**
4. **Keep staging data anonymized** if copying from production
5. **Review code changes** before merging to main
6. **Keep dependencies updated** for security patches

### Database Best Practices

1. **Always back up before schema changes**
2. **Test migrations in staging first**
3. **Never run raw SQL in production** without testing
4. **Keep staging database similar to production** for accurate testing
5. **Monitor database performance** regularly

---

## Quick Reference Commands

### Local Development
```bash
npm run dev                  # Start dev server
npm run build                # Build for production
npx prisma studio            # Open database GUI
npx prisma db push           # Apply schema changes
npm run backup:create        # Create database backup
```

### Git Workflow
```bash
git checkout staging         # Switch to staging
git push origin staging      # Deploy to staging
git checkout main            # Switch to main
git merge staging            # Merge staging to main
git push origin main         # Deploy to production
```

### Railway CLI
```bash
railway login                # Login to Railway
railway logs                 # View application logs
railway run bash             # SSH into service
railway up                   # Manual deploy
```

### Database Operations
```bash
npx prisma generate          # Generate Prisma client
npx prisma db push           # Push schema to database
npx prisma studio            # Open database GUI
pg_dump $DB_URL > backup.sql # Create backup
psql $DB_URL < backup.sql    # Restore backup
```

---

## Support and Resources

### Documentation
- [GIT-WORKFLOW.md](../session-start/GIT-WORKFLOW.md) - Git branch strategy
- [ARCHITECTURE.md](../core-reference/ARCHITECTURE.md) - System architecture
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions

### External Resources
- [Railway Documentation](https://docs.railway.app/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)

### Getting Help

1. Check Railway deployment logs
2. Review this deployment guide
3. Consult troubleshooting section above
4. Check Cloudinary configuration
5. Verify environment variables
6. Review database connectivity

---

**Last Updated:** November 2025
**Remember:** STAGING FIRST, ALWAYS! 🚀
