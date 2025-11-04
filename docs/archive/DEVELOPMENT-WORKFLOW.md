# Development Workflow

## Branch Strategy

### Main Branches
- **`main`** - Production-ready code (deploys to admin.hgraphene.com)
- **`develop`** - Integration branch for new features (deploys to staging)

### Feature Development
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Work on feature, commit changes
git add .
git commit -m "feat: your feature description"

# Push feature branch
git push origin feature/your-feature-name
```

### Testing Changes
```bash
# Test locally first
npm run dev
# Verify all functionality works

# Merge to develop for staging testing
git checkout develop
git merge feature/your-feature-name
git push origin develop
```

### Production Deployment
```bash
# After staging validation, merge to main
git checkout main
git merge develop
git push origin main
# This automatically deploys to production
```

## Local Development

### Initial Setup
```bash
npm install
cp .env.example .env
# Edit .env with your local database credentials
npx prisma generate
npx prisma db push
npm run dev
```

### Running the Application
```bash
npm run dev  # Starts both client and server
```

### Database Management
```bash
npx prisma studio     # Database GUI
npx prisma db push    # Apply schema changes
npx prisma generate   # Regenerate Prisma client
```

## Railway Deployment Environments

### Staging Environment
- **Branch**: `develop`
- **URL**: Auto-generated Railway URL
- **Database**: Separate staging PostgreSQL instance
- **Purpose**: Test features before production

### Production Environment  
- **Branch**: `main`
- **URL**: admin.hgraphene.com (custom domain)
- **Database**: Production PostgreSQL instance
- **Purpose**: Live application

## Environment Variables Management

### Local (.env)
- Copy from `.env.example`
- Use local PostgreSQL instance
- Set `NODE_ENV=development`

### Staging (Railway)
- All production variables except different DATABASE_URL
- Set `NODE_ENV=staging`

### Production (Railway)
- Production DATABASE_URL
- Production OPENAI_API_KEY
- Secure JWT_SECRET
- Set `NODE_ENV=production`

## Best Practices

1. **Always test locally first**
2. **Use staging environment for integration testing**
3. **Never commit secrets to git**
4. **Keep main branch deployable at all times**
5. **Use descriptive commit messages**
6. **Review changes before merging to main**