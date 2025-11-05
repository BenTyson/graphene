# Graphene Admin Documentation

**Quick Navigation:** Find what you need fast with this organized documentation structure.

---

## 🚀 Quick Start (Start Here!)

Perfect for session initialization and common workflows:

- **[SESSION-START.md](session-start/SESSION-START.md)** - Rapid context loading: database schema, deployment URLs, key workflows
- **[GIT-WORKFLOW.md](session-start/GIT-WORKFLOW.md)** - Branch strategy, staging/production workflow, recovery commands

---

## 📚 Core Reference

Deep technical documentation for architecture and APIs:

- **[ARCHITECTURE.md](core-reference/ARCHITECTURE.md)** - System overview, tech stack, design principles
- **[DATABASE-SCHEMA.md](core-reference/DATABASE-SCHEMA.md)** - Complete Prisma schema with relationships
- **[API-REFERENCE.md](core-reference/API-REFERENCE.md)** - REST endpoints and API documentation
- **[COMPONENT-SYSTEM.md](core-reference/COMPONENT-SYSTEM.md)** - UI component library (30+ components)

---

## ⚙️ Workflows

Step-by-step guides for common development tasks:

- **[DEVELOPMENT.md](workflows/DEVELOPMENT.md)** - Local development setup and workflows
- **[DEPLOYMENT.md](workflows/DEPLOYMENT.md)** - ⚠️ **STAGING-FIRST**: Local → Staging → Production deployment guide
- **[TROUBLESHOOTING.md](workflows/TROUBLESHOOTING.md)** - Common issues and debugging strategies

---

## 🎯 Features

Feature-specific implementation documentation:

- **[GRAPHENE-FILTERING.md](features/GRAPHENE-FILTERING.md)** - Species classification and test type filtering system
- **[AI-INSIGHTS.md](features/AI-INSIGHTS.md)** - GPT-4 integration, knowledge base, document processing
- **[NEWS-SYSTEM.md](features/NEWS-SYSTEM.md)** - RSS aggregation, summarization, filtering
- **[NEWS-FILTERING.md](features/NEWS-FILTERING.md)** - Advanced filtering implementation details
- **[CHARACTERIZATION-ANALYSIS.md](features/CHARACTERIZATION-ANALYSIS.md)** - Comparison charts and analysis tools
- **[MATERIAL-TRACKING.md](features/MATERIAL-TRACKING.md)** - Biochar, graphene, and batch tracking

---

## 📖 History

Historical records of major refactors and migrations:

- **[SERVICE-EXTRACTION-2025-09.md](history/SERVICE-EXTRACTION-2025-09.md)** - Service-oriented architecture migration (Sept 2025)
- **[COMPONENT-PHASES.md](history/COMPONENT-PHASES.md)** - Component library evolution (Phases 1-4)
- **[MAJOR-MIGRATIONS.md](history/MAJOR-MIGRATIONS.md)** - Cloudinary, modal stacking, and other major changes

---

## 🔧 Development Environment

**Staging (Always deploy here first!):** Railway staging environment
**Production:** admin.hgraphene.com (Railway, main branch)
**Local:** localhost:5174 (Vite dev server)

**Important Branches:**
- `main` - Production branch
- `staging` - Testing branch (work here!)

---

## 📁 Other Documentation

- **[archive/](archive/)** - Archived historical documentation
- **[CLAUDE.local.md](CLAUDE.local.md)** - Local project configuration (not checked in)

---

## 💡 Tips for AI Agents

**For session initialization:**
1. Read `session-start/SESSION-START.md` first for rapid context
2. Check `core-reference/DATABASE-SCHEMA.md` for data models
3. Review `session-start/GIT-WORKFLOW.md` for branch strategy

**For development work:**
1. Always work on `staging` branch
2. Deploy to staging first, test, then merge to `main`
3. Use `/dbbackup` before major changes

**For debugging:**
1. Check `workflows/TROUBLESHOOTING.md` first
2. Review feature-specific docs in `features/`
3. Reference API docs in `core-reference/API-REFERENCE.md`

---

**Last Updated:** January 2025
**Documentation Structure Version:** 2.0 (Reorganized for session-start efficiency)
