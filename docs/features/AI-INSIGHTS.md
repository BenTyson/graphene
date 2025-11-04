# AI Insights System Documentation

## Overview
The AI Insights system provides intelligent analysis of graphene production data using OpenAI GPT-4, offering data-driven recommendations for optimization, scaling, and quality improvement. The system integrates production data with a knowledge base of research documents to provide comprehensive, research-backed insights.

## Key Features

### 1. Data Analysis & Filtering
- **Smart Filtering**: Filter analysis by oven type (A/B/C), species, and time range
- **Comprehensive Data Integration**: Includes compound batch and micronization data when selected
- **Real-time Processing**: Analyzes up to 241 graphene experiments with associated test results

### 2. AI-Powered Analysis Modules

#### Process Variable Correlations
- Identifies top 5 strongest correlations between process variables and quality outcomes
- Analyzes biochar inputs, graphene process parameters, and quality metrics
- Provides actionable insights with specific parameter ranges

#### Yield & Quality Optimization
- Recommends optimal parameter combinations for high yield (>4g) AND high quality (>1500 m²/g BET)
- Identifies "sweet spot" ranges for key variables
- Calculates trade-offs between yield and quality improvements
- Suggests specific experimental conditions to test

#### Production Scaling Insights
- Analyzes batch size effects on quality and yield
- Predicts quality changes when scaling to larger batches
- Identifies critical parameters that may change at scale
- Provides scaling timeline and validation recommendations

#### AI-Suggested Next Experiments
- Identifies gaps in experimental parameter space
- Designs experiments based on current priorities (yield, quality, scaling)
- Provides systematic DOE (Design of Experiments) recommendations
- Includes risk assessment and learning objectives for each suggestion

#### Custom AI Analysis
- Free-form queries about production data
- Context-aware responses based on selected data scope
- Integrates knowledge base documents for enhanced insights

### 3. Knowledge Base Integration

#### Document Management
- **Supported Formats**: PDF, Word (.doc, .docx), plain text
- **Document Types**: Research papers, patents, technical reports, whitepapers, theses
- **Categories**: Graphene production, biochar processing, material characterization, etc.
- **File Size Limit**: 50MB per document

#### Document Processing Pipeline
1. **Upload**: Secure file upload with validation
2. **Text Extraction**: Automated extraction from various formats
3. **AI Analysis**: GPT-4 powered summarization and key findings extraction
4. **Relevance Scoring**: 0-10 scale based on content relevance to graphene production
5. **Integration**: Relevant documents automatically included in AI analysis context

#### Processing Features
- Automatic duplicate detection via content hashing
- Batch processing for multiple documents
- Retry mechanism for failed processing
- Real-time processing status tracking

## Technical Architecture

### Backend Services

#### AIInsightsService (`/server/services/AIInsightsService.js`)
- **Core AI Integration**: OpenAI GPT-4 API integration
- **Smart Caching**: 15-minute cache to manage API costs
- **Knowledge Base Context**: Automatically retrieves relevant research documents
- **Methods**:
  - `analyzeCorrelations()`: Process variable correlation analysis
  - `optimizeYieldAndQuality()`: Optimization recommendations
  - `analyzeScaling()`: Production scaling analysis
  - `suggestNextExperiments()`: Experiment design suggestions
  - `getRelevantKnowledgeContext()`: Knowledge base integration

#### DocumentProcessingService (`/server/services/DocumentProcessingService.js`)
- **Text Extraction**: Handles PDF, Word, and text files
- **AI Analysis**: Generates summaries, layman explanations, and key findings
- **Relevance Scoring**: Calculates document relevance to graphene production
- **Batch Processing**: Processes multiple documents asynchronously

### API Endpoints

#### AI Insights (`/api/ai-insights/*`)
- `GET /dashboard`: Main insights dashboard data
- `GET /correlations`: Process variable correlation analysis
- `GET /optimization`: Yield and quality optimization
- `GET /scaling`: Production scaling analysis
- `GET /experiments`: AI-suggested experiments
- `POST /analyze`: Custom AI analysis
- `POST /refresh`: Cache management

#### Knowledge Base (`/api/knowledge-base/*`)
- `GET /`: List all knowledge documents
- `GET /:id`: Get specific document
- `POST /upload`: Upload new document
- `PATCH /:id`: Update document metadata
- `DELETE /:id`: Delete document
- `POST /:id/process`: Process specific document
- `POST /process-all`: Batch process pending documents
- `GET /processing/stats`: Processing statistics

### Database Schema

#### KnowledgeDocument Model
```prisma
model KnowledgeDocument {
  id                    String            @id
  title                 String
  description           String?
  filename              String
  filePath              String
  documentType          DocumentType
  documentCategory      DocumentCategory?
  processingStatus      ProcessingStatus
  extractedText         String?
  summary               String?
  laymanSummary         String?
  keyFindings           String[]
  relevanceScore        Decimal?
  // ... additional fields
}
```

### Frontend Components

#### AIInsightsTab (`/client/src/js/components/tabs/AIInsightsTab.js`)
- **Analysis Configuration Panel**: Filter controls and data selection
- **Interactive Visualizations**: Real-time analysis results
- **Markdown Rendering**: Formatted AI responses with proper styling
- **Loading States**: Graceful handling of async operations

## Usage Guide

### Getting Started
1. Navigate to the "Insights" tab in the application
2. Configure analysis filters (optional):
   - Select oven type
   - Choose species
   - Set time range
   - Include compound batches/micronization data
3. Click "Apply Filters" to update analysis scope

### Running Analysis
1. **Correlation Analysis**: Click "Analyze" in the Process Variable Correlations section
2. **Optimization**: Click "Optimize" in the Yield & Quality Optimization section
3. **Scaling Analysis**: Click "Analyze Scaling" for production scaling insights
4. **Experiment Suggestions**: Click "Get Suggestions" for AI-designed experiments
5. **Custom Query**: Enter your question and click "Analyze"

### Managing Knowledge Base
1. **Upload Documents**:
   - Use the knowledge base upload endpoint
   - Provide title, document type, and category
   - System automatically processes and extracts content
2. **Monitor Processing**:
   - Check processing status via API
   - View processing statistics
   - Retry failed documents if needed
3. **Integration**: Documents are automatically included in relevant AI analyses

## Configuration

### Environment Variables
```env
OPENAI_API_KEY=your-api-key-here  # Required for AI functionality
DATABASE_URL=postgresql://...      # PostgreSQL connection
```

### Caching Strategy
- **Cache Duration**: 15 minutes for AI analysis results
- **Invalidation**: Automatic when new data arrives
- **Manual Refresh**: Available via refresh button or API

## Best Practices

### Data Quality
- Ensure comprehensive test data (BET, conductivity, RAMAN) for best insights
- Regular data updates improve AI recommendation accuracy
- Include compound batch data for scaling insights

### Knowledge Base
- Upload relevant research papers and patents
- Keep documents categorized properly
- Process documents in batches during off-peak hours
- Review and update document metadata for better matching

### API Usage
- Use filtering to reduce analysis scope and improve relevance
- Leverage caching to minimize API costs
- Batch similar analyses together
- Monitor processing status for large document uploads

## Troubleshooting

### Common Issues

#### "AI analysis temporarily unavailable"
- Check OpenAI API key configuration
- Verify API quota and billing status
- Check server logs for specific errors

#### Document Processing Failures
- Verify file format is supported
- Check file size (<50MB)
- Ensure proper file permissions
- Review processing error messages

#### Empty Analysis Results
- Verify data exists in the database
- Check filter settings aren't too restrictive
- Ensure proper database connections

### Performance Optimization
- Enable caching for frequently accessed analyses
- Use batch processing for multiple documents
- Implement rate limiting for API calls
- Monitor and optimize database queries

## Security Considerations

### File Upload Security
- File type validation (MIME type and extension)
- Content validation for malicious patterns
- File size limits (50MB)
- Sanitized filenames
- Secure file storage paths

### API Security
- API key management via environment variables
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- XSS prevention with proper HTML escaping

## Future Enhancements

### Planned Features
- Real-time collaborative analysis
- Advanced visualization charts
- Export analysis reports to PDF
- Automated analysis scheduling
- Machine learning model training on historical data
- Integration with external research databases

### Potential Improvements
- Enhanced PDF text extraction with OCR
- Multi-language document support
- Voice-activated queries
- Mobile app integration
- Advanced caching strategies
- Webhook notifications for analysis completion

## Support & Maintenance

### Monitoring
- Track API usage and costs
- Monitor cache hit rates
- Log processing failures
- Track user engagement metrics

### Updates
- Regular OpenAI model updates
- Knowledge base content refresh
- Algorithm improvements based on user feedback
- Security patches and dependency updates

---

*Last Updated: September 2025*
*Version: 1.0.0*