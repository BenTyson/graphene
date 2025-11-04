# Deployment Workflow Guide

## Environment Overview

The Graphene Production Control System uses a three-tier deployment strategy:

1. **Local Development** (`localhost:5174`)
   - Active development and testing
   - Uses local PostgreSQL database
   - Cloudinary folder: `graphene-uploads-dev`

2. **Staging** (Railway - staging URL)
   - Pre-production testing environment
   - Separate PostgreSQL database
   - Cloudinary folder: `graphene-uploads-staging`
   - Branch: `staging`

3. **Production** (Railway - admin.hgraphene.com)
   - Live production environment
   - Production PostgreSQL database
   - Cloudinary folder: `graphene-uploads`
   - Branch: `main`

## Deployment Flow

```
Local Development → Staging → Production
     (develop)     (staging)    (main)
```

## Branch Strategy

### Active Branches
- **`develop`** - Active development branch
- **`staging`** - Staging deployment branch
- **`main`** - Production deployment branch
- **Feature branches** - Individual features/fixes

### Workflow Steps

#### 1. Local Development
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes and test locally
npm run dev

# Commit changes
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

#### 2. Deploy to Staging
```bash
# Merge feature into staging
git checkout staging
git pull origin staging
git merge feature/your-feature-name

# Push to trigger staging deployment
git push origin staging
```

Railway will automatically deploy to staging environment.

#### 3. Deploy to Production
After testing in staging:
```bash
# Merge staging into main
git checkout main
git pull origin main
git merge staging

# Push to trigger production deployment
git push origin main
```

Railway will automatically deploy to production environment.

## Railway Configuration

### Setting Up Staging Environment

1. **Create New Service in Railway**
   - Log into Railway dashboard
   - Click "New Service" in your project
   - Select "GitHub Repo"
   - Choose the `graphene` repository
   - Select `staging` branch for deployment

2. **Configure Staging Environment Variables**
   ```
   NODE_ENV=staging
   DATABASE_URL=[staging database connection string]
   JWT_SECRET=[your jwt secret]
   OPENAI_API_KEY=[your openai key]
   CLOUDINARY_CLOUD_NAME=[your cloudinary name]
   CLOUDINARY_API_KEY=[your cloudinary key]
   CLOUDINARY_API_SECRET=[your cloudinary secret]
   USE_CLOUDINARY=true
   ```

3. **Create Staging Database**
   - Add PostgreSQL service to Railway
   - Name it "graphene-staging-db"
   - Copy connection string to DATABASE_URL

4. **Configure Domain (Optional)**
   - Add custom domain: staging.hgraphene.com
   - Or use Railway's generated URL

### Production Environment Variables
Same as staging but with:
- `NODE_ENV=production`
- Production database URL
- Production domain: admin.hgraphene.com

## Cloudinary Folder Structure

```
cloudinary.com/your-account/
├── graphene-uploads/         # Production files
├── graphene-uploads-staging/ # Staging files
└── graphene-uploads-dev/     # Development files
```

## Database Management

### Staging Database Setup
```bash
# After creating staging database in Railway
# The startup script will automatically:
# 1. Run Prisma migrations
# 2. Seed initial users
# 3. Start the application
```

### Data Refresh (Optional)
To copy production data to staging for testing:
```bash
# Export from production (be careful!)
pg_dump $PRODUCTION_DATABASE_URL > prod-backup.sql

# Import to staging
psql $STAGING_DATABASE_URL < prod-backup.sql
```

## Testing Checklist

### Before Promoting to Production
- [ ] All features work in staging
- [ ] File uploads work (Cloudinary integration)
- [ ] PDF viewing works correctly
- [ ] Authentication works
- [ ] Database operations successful
- [ ] No console errors
- [ ] Performance acceptable

## Rollback Procedures

### Quick Rollback
```bash
# Revert production to previous version
git checkout main
git revert HEAD
git push origin main
```

### Database Rollback
Keep regular backups using:
```bash
npm run backup:db
```

## Environment-Specific Features

### Development Only
- Detailed error messages
- Debug logging
- Hot module reloading

### Staging
- Production-like environment
- Separate test data
- Performance monitoring

### Production
- Optimized builds
- Error tracking
- Security headers
- Rate limiting

## Common Issues and Solutions

### Issue: Staging deployment fails
**Solution**: Check Railway logs, verify environment variables, ensure database is accessible

### Issue: Cloudinary files not loading
**Solution**: Verify PDF delivery is enabled in Cloudinary settings, check folder names

### Issue: Database migrations fail
**Solution**: Check migration scripts, verify database connection, review Prisma schema

## Monitoring

### Railway Dashboard
- Monitor deployments
- View logs
- Check resource usage
- Set up alerts

### Application Health
- Check `/api/health` endpoint
- Monitor error rates
- Track performance metrics

## Security Notes

- Never commit `.env` files
- Use different JWT secrets per environment
- Regularly rotate API keys
- Keep staging data anonymized if using production copies

## Support

For deployment issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Check Cloudinary configuration
4. Review database connectivity

## Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Run database migrations
npx prisma migrate dev

# Create database backup
npm run backup:db

# View Railway logs
railway logs

# SSH into Railway service (if needed)
railway run bash
```