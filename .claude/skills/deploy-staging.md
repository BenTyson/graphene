# Deploy to Staging

Deploy changes to the Railway staging environment for testing.

## Pre-Deployment Checklist

Before deploying to staging, verify:

1. **On staging branch**: Run `git status` to confirm you're on the staging branch
2. **Local tests pass**: Run `npm run dev` and verify functionality works locally
3. **No console errors**: Check browser console for errors
4. **Database backup** (if schema changes): Run `npm run backup:create "pre-staging-deploy"`

## Deployment Steps

### 1. Verify Branch
```bash
git status
# Should show: On branch staging
```

If not on staging:
```bash
git checkout staging
git pull origin staging
```

### 2. Commit Changes
```bash
git add .
git commit -m "feat: description of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Push to Staging
```bash
git push origin staging
```

**Railway will automatically deploy to staging environment**

### 4. Monitor Deployment

- Check Railway logs for deployment status
- Wait for deployment to complete (usually 2-3 minutes)
- Verify staging URL loads correctly

### 5. Test in Staging

**MANDATORY TESTING CHECKLIST:**
- [ ] Application loads without errors
- [ ] New features work correctly
- [ ] File uploads work (if modified)
- [ ] Database operations succeed
- [ ] No console errors
- [ ] Authentication works
- [ ] Performance is acceptable

### 6. Next Steps

**If staging tests PASS:**
- Proceed to production deployment (use `/deploy-prod` skill)

**If staging tests FAIL:**
- Review Railway logs
- Fix issues locally
- Re-deploy to staging
- DO NOT proceed to production!

## Important Reminders

- **Staging First, Always!**: Never skip staging testing
- **Railway automatically deploys** on push to staging branch
- **Staging URL**: Check Railway dashboard for staging environment URL
- **Environment Variables**: Verify in Railway dashboard if deployment fails

## Rollback

If deployment breaks staging:

```bash
git revert HEAD
git push origin staging
```

Railway will automatically redeploy the previous version.

## Troubleshooting

**Deployment fails:**
- Check Railway logs
- Verify environment variables in Railway dashboard
- Ensure database is accessible
- Review build errors

**Application won't load:**
- Check Railway logs for runtime errors
- Verify Cloudinary configuration
- Check database connection

For more details, see: `/docs/workflows/DEPLOYMENT.md`
