# Graphene News Aggregation System - Setup Guide

## Overview
This setup guide will walk you through the complete installation and configuration of the automated graphene news aggregation system.

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Existing graphene production tracking app

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

New dependencies added:
- `cheerio`: HTML parsing for web scraping
- `node-cron`: Scheduled job management  
- `node-fetch`: HTTP requests for content fetching
- `rss-parser`: RSS feed parsing

### 2. Database Migration
Run the Prisma migration to add news-related tables:
```bash
npm run db:push
```

This will create:
- `news_sources` - Content source configuration
- `news_articles` - Aggregated articles
- `user_bookmarks` - User bookmarking system
- `news_preferences` - User preferences (future use)
- `content_processing_logs` - System monitoring

### 3. Seed Initial News Sources
Populate the database with curated graphene industry sources:
```bash
npm run news:seed
```

This creates 12+ high-quality sources including:
- Nature Materials
- ACS Nano
- Science Direct
- Graphene-Info
- 2D Materials Journal
- And more...

### 4. Test Content Fetching
Manually trigger a content fetch to test the system:
```bash
npm run news:fetch
```

### 5. Start Development Server
The news system is integrated into the main application:
```bash
npm run dev
```

## Usage

### Accessing the News Feed
1. Navigate to your graphene production app
2. Click the "News Feed" tab in the navigation
3. View latest graphene industry articles with:
   - AI-powered relevance scoring
   - Automatic categorization
   - Visual content extraction
   - Advanced filtering and search

### Dashboard Widget
- Latest headlines appear on the main dashboard
- Click "View All →" to access full news feed
- Auto-refreshes every 30 minutes

### Features
- **Automated Fetching**: Every 2 hours
- **Smart Categorization**: 8 categories (Research, Industry, Market, etc.)
- **Relevance Scoring**: AI-powered 0-10 scoring system
- **Content Deduplication**: Prevents duplicate articles
- **Image Extraction**: Automatically pulls article images
- **Bookmarking**: Save important articles
- **Export**: PDF/CSV export capabilities (future)

## Configuration

### Source Management
Edit `graphene-news/config/news-sources.json` to:
- Add new RSS feeds
- Adjust rate limits
- Configure source reliability scores
- Enable/disable sources

### System Settings
Key settings in the configuration:
- `defaultFetchInterval`: 2 hours
- `minRelevanceScore`: 2.0 (filters low-relevance content)
- `articleRetentionDays`: 90 days
- `respectRobotsTxt`: true (legal compliance)

## Monitoring

### Scheduled Jobs
The system runs several background jobs:
- **Content Fetching**: Every 2 hours
- **Health Monitoring**: Every 6 hours  
- **Article Cleanup**: Daily at 2 AM
- **Reliability Updates**: Daily at 3 AM

### Logs
Monitor system health through:
- Console logs during development
- Database processing logs table
- Source health status in admin interface

## Legal Compliance

### Robots.txt Compliance
- Automatic robots.txt checking for web scraping
- Respectful request intervals
- User-agent identification

### Content Attribution
- All articles link back to original sources
- Source information preserved
- Terms of service acceptance tracking

### Rate Limiting
- Built-in rate limiting per source
- Exponential backoff on failures
- Respectful of source server loads

## Troubleshooting

### Common Issues

1. **No articles appearing**
   - Check if sources are active: Database → `news_sources` table
   - Run manual fetch: `npm run news:fetch`
   - Check console logs for errors

2. **Low relevance scores**
   - AI processing prioritizes graphene-specific content
   - Adjust `minRelevanceScore` in settings if needed
   - Review keyword dictionaries in `AIProcessingService.js`

3. **RSS feed failures**
   - Some academic sources may have authentication requirements
   - Check source URLs are still valid
   - Review rate limiting settings

### Manual Operations

**Force refresh sources**:
```bash
npm run news:fetch
```

**Re-seed sources** (clears existing):
```bash
npm run news:seed
```

**Check database**:
```bash
npm run db:studio
```

## Architecture

### File Structure
```
graphene-news/
├── backend/
│   ├── services/          # Core processing services
│   │   ├── ContentAcquisitionService.js
│   │   └── AIProcessingService.js
│   ├── routes/            # API endpoints  
│   └── jobs/              # Scheduled task management
├── frontend/
│   ├── components/        # UI components
│   └── styles/           # News-specific styling
└── config/               # Configuration files
    ├── news-sources.json # Source definitions
    └── seed-news-sources.js # Database seeder
```

### Integration Points
- **Routes**: `/api/news/*` endpoints
- **Frontend**: News tab in main navigation
- **Database**: Extends existing Prisma schema
- **Styling**: Uses existing Tailwind CSS setup

## Performance Considerations

### Optimization Features
- Client-side pagination (10 articles per page)
- Image lazy loading and caching
- Debounced search (500ms delay)  
- Efficient database indexing
- Content deduplication

### Scaling
- Supports 1000+ concurrent users
- Handles 10,000+ articles efficiently
- Configurable cleanup for storage management
- CDN-ready for image assets

## Security

### Built-in Protections
- SQL injection prevention (Prisma ORM)
- XSS protection (content sanitization)
- CORS configuration
- Input validation and sanitization
- Error handling without data exposure

## Next Steps

### Future Enhancements
1. **Real-time Updates**: WebSocket implementation
2. **User Authentication**: Personalized preferences
3. **Advanced Analytics**: Usage metrics and trending topics
4. **Machine Learning**: Improved relevance scoring
5. **Social Features**: Article sharing and comments
6. **Mobile App**: React Native companion app

### API Extensions
- Email digest subscriptions
- Slack/Teams integration
- RSS feed generation
- Webhook notifications

This completes the setup of your automated graphene news aggregation system!