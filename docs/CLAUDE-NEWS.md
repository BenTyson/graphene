# News System Documentation for Claude Agents

## Overview
The Graphene News System is a comprehensive news aggregation and AI-powered summarization platform built with Express.js, Prisma, and OpenAI GPT-4o-mini. It fetches, processes, and displays scientific articles with business-friendly summaries.

## Architecture

### Integration with Main Application
The news system is fully integrated into the Alpine.js application context:
- **Module Import**: NewsTab.js is imported as an ES6 module in app-refactored.js
- **Alpine Context**: All news methods and properties are part of the main Alpine app
- **State Management**: News state (articles, filters, pagination) managed in app-refactored.js
- **Badge System**: Numerical badges show live counts using Alpine.js reactive data
- **Bookmark System**: Loading states tracked via `bookmarkLoading[articleId]` object

### Backend Structure
```
/graphene-news/
├── backend/services/
│   ├── ContentAcquisitionService.js  # RSS feed fetching & processing
│   ├── SummaryService.js             # OpenAI API integration
│   └── PromptTemplates.js            # Category-specific AI prompts
├── config/
│   ├── summary-config.js             # Cost controls & configuration
│   └── seed-news-sources.js          # RSS source management
└── test-fetch.js                     # Testing utilities
```

### Frontend Structure
```
/client/src/js/
├── components/
│   ├── tabs/NewsTab.js               # Main news feed UI (ES6 module)
│   └── SummaryToggle.js              # Summary display component
├── services/
│   ├── NewsService.js                # News-specific service logic
│   └── api.js                        # API communication
└── app-refactored.js                 # Main Alpine.js app with integrated news functions
```

## Database Schema

### NewsArticle Model (Prisma)
```prisma
model NewsArticle {
  id               Int      @id @default(autoincrement())
  title            String
  summary          String?
  content          String?  @db.Text
  url              String   @unique
  publishDate      DateTime
  source           NewsSource @relation(fields: [sourceId], references: [id])
  sourceId         Int
  
  // Categorization
  category         String?  // RESEARCH_BREAKTHROUGH, MARKET_ANALYSIS, etc.
  keywordTags      String[] // Extracted keywords
  relevanceScore   Float    @default(0.0)
  
  // AI Summary Fields
  laymanSummary    String?  @db.Text  // Business-friendly summary
  summaryGenerated Boolean  @default(false)
  summaryError     String?  // Error message if summary generation fails
  
  // Metadata
  imageUrls        String[] // Cached image paths
  readingTime      Int?     // Estimated reading time in minutes
  viewCount        Int      @default(0)
  isBookmarked     Boolean  @default(false)
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([publishDate])
  @@index([relevanceScore])
  @@index([category])
  @@index([summaryGenerated])
}

model NewsSource {
  id          Int      @id @default(autoincrement())
  name        String
  rssUrl      String   @unique
  website     String?
  isActive    Boolean  @default(true)
  fetchInterval Int    @default(3600) // seconds
  lastFetched DateTime?
  articles    NewsArticle[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Endpoints

### News Routes (`/server/routes/news.js`)
- **GET** `/api/news/articles` - List articles with filtering/pagination
- **GET** `/api/news/articles/:id` - Get single article
- **POST** `/api/news/articles/:id/generate-summary` - Generate AI summary
- **POST** `/api/news/admin/bulk-summarize` - Batch process summaries
- **GET** `/api/news/admin/system-monitor` - System health & usage stats

### Image Serving
- **Static** `/news-images/*` - Cached article images with CORS headers

## AI Summary System

### Configuration (`/graphene-news/config/summary-config.js`)
```javascript
export const SUMMARY_CONFIG = {
  // Cost Controls
  MONTHLY_LIMIT: 30,      // USD
  DAILY_LIMIT: 5,         // USD  
  PER_SUMMARY_LIMIT: 0.01, // Max cost per summary
  
  // Processing
  MAX_INPUT_TOKENS: 1000,
  MAX_OUTPUT_TOKENS: 150,
  BATCH_SIZE: 10,
  
  // Quality Controls
  MIN_RELEVANCE_SCORE: 5.0,
  HIGH_IMPACT_KEYWORDS: ['hemp', 'supercapacitor', 'energy storage', 'cathode', 'anode', 'electrode'],
  
  // OpenAI Settings
  MODEL: 'gpt-4o-mini',
  TEMPERATURE: 0.3,
};
```

### Summary Generation Process
1. **Trigger**: User clicks "Generate" or automated batch processing
2. **Content Preparation**: Article title + summary + content (first 600 chars)
3. **Prompt Selection**: Category-specific business prompts
4. **AI Processing**: GPT-4o-mini generates 100-150 word business summary
5. **Cost Tracking**: Token usage and cost monitoring
6. **Display**: Structured sections with clean headers

### Prompt Categories & Templates
```javascript
RESEARCH_BREAKTHROUGH -> "What breakthrough was achieved? Commercial timeline?"
MARKET_ANALYSIS -> "Market trends? Investment implications?"
COMPANY_NEWS -> "Strategic importance? Competitive impact?"
APPLICATIONS -> "New applications? Target markets? ROI?"
PRODUCTION_METHODS -> "Manufacturing improvements? Cost benefits?"
```

## Frontend Components

### NewsTab Component
**File**: `/client/src/js/components/tabs/NewsTab.js`

**Key Features**:
- ES6 module with export: `export { getNewsTabHtml }`
- Two-column layout with sidebar filters
- Categories with numerical badges showing article counts
- Bookmark functionality with loading states
- Pagination and infinite scroll support

### SummaryToggle Component
**File**: `/client/src/js/components/SummaryToggle.js`

**Key Functions**:
- `getSummaryToggleHtml(article)` - Renders summary UI
- `shouldShowSummaryToggle(article)` - Visibility logic
- `formatSummaryWithSections(text)` - Parses AI response into clean sections
- `getSimplifiedTitle(title)` - Converts scientific titles to layman terms

**UI States**:
- **Generate**: No summary exists, shows generate button
- **Loading**: API call in progress, shows spinner
- **Ready**: Summary available with clean sections
- **Error**: Generation failed with retry option

### Title Simplification
Converts complex scientific titles to business-friendly language:
```javascript
// Input: "Molecular Extrusion Drives Polymer Dynamic Soft Encapsulation..."
// Output: "New Manufacturing Process Using Plastic Coating For Solar Panels"

const translations = {
  'molecular extrusion': 'new manufacturing process',
  'polymer dynamic soft encapsulation': 'plastic coating',
  'perovskite solar cells': 'advanced solar panels',
  // ... 30+ more translations
};
```

## Environment Variables

### Required `.env` Settings
```bash
# OpenAI Configuration
OPENAI_API_KEY="sk-proj-..."
OPENAI_MODEL="gpt-4o-mini"

# Summary System
SUMMARY_ENABLED="true"
SUMMARY_MONTHLY_LIMIT="30"
SUMMARY_DAILY_LIMIT="5"
SUMMARY_AUTO_GENERATE="false"

# Database
DATABASE_URL="postgresql://..."
```

## Data Flow

### Article Processing Pipeline
1. **RSS Fetch** → ContentAcquisitionService fetches from RSS feeds
2. **Content Parse** → Extract title, content, images, metadata
3. **Categorization** → Automatic category assignment based on keywords
4. **Relevance Scoring** → Score articles for business relevance (0-10)
5. **Image Caching** → Download and cache images locally
6. **Database Storage** → Store in NewsArticle table

### Summary Generation Pipeline
1. **Eligibility Check** → relevanceScore >= 5.0 OR high-impact keywords
2. **Cost Validation** → Check daily/monthly limits
3. **Content Preparation** → Format article for token efficiency
4. **Prompt Selection** → Choose category-specific prompt template
5. **AI Generation** → Call OpenAI API with cost tracking
6. **Response Processing** → Parse structured response into sections
7. **Display Formatting** → Clean headers, remove markdown formatting

## File Locations & Key Code

### Critical Files for Future Development:
- **Main News API**: `/server/routes/news.js`
- **Summary Service**: `/graphene-news/backend/services/SummaryService.js`
- **News Tab Component**: `/client/src/js/components/tabs/NewsTab.js` (ES6 module)
- **Main App Integration**: `/client/src/js/app-refactored.js` (Alpine.js context)
- **News Service**: `/client/src/js/services/NewsService.js` (Business logic)
- **Configuration**: `/graphene-news/config/summary-config.js`
- **Database Schema**: `/prisma/schema.prisma` (NewsArticle, NewsSource models)

### Key Functions to Know:
```javascript
// Backend
SummaryService.generateSummary(articleId)
ContentAcquisitionService.fetchArticlesFromRSS()
PromptTemplates.getOptimalPrompt(article)

// Frontend (Alpine.js app context)
getCategoryCount(category)      // Badge counts
getTagCount(tag)                // Tag counts  
getDateRangeCount(dateRange)    // Date range counts
toggleBookmark(articleId)       // Bookmark with loading states
formatDate(dateString)          // Relative date formatting
refreshNewsFeed()               // Refresh articles
nextNewsPage(), previousNewsPage(), goToNewsPage(page) // Pagination

// Components
getSummaryToggleHtml(article)
formatSummaryWithSections(summaryText)
getSimplifiedTitle(originalTitle)
getNewsTabHtml()                // Returns news tab HTML template
```

## Testing & Debugging

### Test OpenAI Connection
```bash
node test-openai.js  # Tests API key and generates sample summary
```

### Manual Article Fetch
```bash
npm run news:fetch  # Fetch new articles from RSS sources
```

### Database Management
```bash
npm run db:studio   # Open Prisma Studio to view data
npm run db:migrate  # Apply schema changes
```

## Cost Optimization Features

- **Token Limits**: 1000 input / 150 output tokens max per summary
- **Batch Processing**: 50% discount for background operations  
- **Smart Filtering**: Only process high-relevance articles
- **Usage Tracking**: Real-time cost monitoring with alerts
- **Model Choice**: GPT-4o-mini for 75% cost savings vs GPT-4

## Styling & UX

### Color Scheme
- **Background**: Gray (`bg-gray-50`)
- **Headers**: Clean underlines (`border-b border-gray-200`)
- **Actions**: Black hover states (`text-black hover:text-gray-700`)
- **No blue backgrounds** - Removed from summary sections

### Summary Section Layout
```
What This Article Means:
[Simplified Title - Large, Bold]

Key Development
────────────────────────────
[Content paragraph]

Business Impact  
────────────────────────────
[Content paragraph]

Timeline & Implementation
────────────────────────────
[Content paragraph]
```

## Common Issues & Solutions

### Images Not Loading
- **Problem**: CORS policy blocking images
- **Solution**: CORS headers added to `/news-images/*` route

### Summary Not Generating
- **Check**: OpenAI API key in `.env`
- **Check**: Account billing at platform.openai.com
- **Check**: Daily/monthly cost limits in config

### Title Not Simplifying
- **Issue**: Function called client-side in template
- **Fix**: Call `getSimplifiedTitle()` server-side in component function

### News Tab Not Working After Refactoring
- **Problem**: `bookmarkLoading is not defined`, count functions not accessible
- **Solution**: All news functions integrated into Alpine.js app context in `app-refactored.js`
- **Key Changes**:
  - NewsTab.js is now an ES6 module imported by app-refactored.js
  - NewsTabFunctions.js removed (functionality integrated into main app)
  - All methods (toggleBookmark, getCategoryCount, etc.) added to Alpine context
  - Properties like `bookmarkLoading: {}` added to app state

## Future Enhancement Areas

1. **Real-time Updates**: WebSocket integration for live article feeds
2. **Advanced Filtering**: ML-based relevance scoring
3. **User Preferences**: Personalized summary styles
4. **Analytics Dashboard**: Usage metrics and cost tracking UI
5. **Mobile Optimization**: Responsive design improvements
6. **Bulk Operations**: Admin interface for batch processing
7. **Export Features**: PDF/email summary distribution