# Session Start

Load comprehensive codebase context for the Graphene Production Control System.

## Instructions

Read the following documentation files in this order for rapid context loading:

1. **Session Overview**: Read `/docs/session-start/SESSION-START.md` first for quick context
2. **Database Schema**: Read `/docs/core-reference/DATABASE-SCHEMA.md` for data models
3. **Git Workflow**: Read `/docs/session-start/GIT-WORKFLOW.md` for branch strategy

After reading these files, you will have complete context on:
- System architecture and tech stack
- Database schema and relationships
- Deployment environments (staging/production)
- Git workflow (staging-first approach)
- Common commands and troubleshooting

## Critical Reminders

- **ALWAYS work on staging branch** - Never deploy directly to main!
- **Create database backup before major changes**: `npm run backup:create "description"`
- **Staging deployment URL**: Railway staging environment
- **Production URL**: admin.hgraphene.com

## Quick References

- **Full documentation map**: `/docs/README.md`
- **API reference**: `/docs/core-reference/API-REFERENCE.md`
- **Deployment guide**: `/docs/workflows/DEPLOYMENT.md`
- **Feature docs**: `/docs/features/`

You are now ready to start working on the Graphene codebase!
