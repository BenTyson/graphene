import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class DocumentProcessingService {
  constructor() {
    this.openai = null;
    this.processingQueue = new Map();
    this.maxRetries = 3;
  }

  _getClient() {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  /**
   * Process a knowledge document: extract text, generate summaries, calculate relevance
   * @param {string} documentId - KnowledgeDocument ID
   * @param {Object} prisma - Prisma client instance
   * @returns {Promise<Object>} Processing results
   */
  async processDocument(documentId, prisma) {
    try {
      // Mark as processing
      await this.updateDocumentStatus(documentId, 'PROCESSING', null, prisma);

      // Get document details
      const document = await prisma.knowledgeDocument.findUnique({
        where: { id: documentId }
      });

      if (!document) {
        throw new Error('Document not found');
      }

      console.log(`Processing document: ${document.title}`);

      // Extract text from document
      const extractedText = await this.extractText(document);

      // Generate AI-powered analysis
      const aiAnalysis = await this.generateAIAnalysis(document, extractedText);

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(document, extractedText, aiAnalysis);

      // Update document with processed data
      const updatedDocument = await prisma.knowledgeDocument.update({
        where: { id: documentId },
        data: {
          extractedText,
          summary: aiAnalysis.summary,
          laymanSummary: aiAnalysis.laymanSummary,
          keyFindings: aiAnalysis.keyFindings,
          relevanceScore,
          processingStatus: 'COMPLETED',
          processingError: null,
          lastProcessedAt: new Date(),
          processingAttempts: document.processingAttempts + 1
        }
      });

      console.log(`Document processed successfully: ${document.title}`);

      return {
        success: true,
        document: updatedDocument
      };

    } catch (error) {
      console.error(`Document processing error for ${documentId}:`, error);
      
      // Update error status
      await this.updateDocumentStatus(
        documentId, 
        'FAILED', 
        error.message, 
        prisma
      );

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract text content from various document types
   * @param {Object} document - KnowledgeDocument record
   * @returns {Promise<string>} Extracted text
   */
  async extractText(document) {
    const filePath = document.filePath;
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    switch (document.mimeType) {
      case 'application/pdf':
        return await this.extractPDFText(filePath);
      
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf8');
      
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractWordText(filePath);
      
      default:
        throw new Error(`Unsupported file type: ${document.mimeType}`);
    }
  }

  /**
   * Extract text from PDF files using simple text extraction
   * Note: For production, consider using libraries like pdf-parse or pdf2pic
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractPDFText(filePath) {
    try {
      // For now, return a placeholder - in production you'd use a proper PDF library
      // Example with pdf-parse: const pdf = await pdfParse(buffer);
      
      // Simple approach: read file and extract basic metadata
      const fileBuffer = fs.readFileSync(filePath);
      const textContent = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 2000));
      
      // Extract any readable text from PDF structure
      const pdfTextMatch = textContent.match(/\(([^)]+)\)/g);
      if (pdfTextMatch) {
        const extractedText = pdfTextMatch
          .map(match => match.replace(/[()]/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extractedText.length > 100) {
          return extractedText;
        }
      }

      // Fallback: return basic file info for AI to understand this is a PDF
      return `PDF Document: ${path.basename(filePath)}
File Size: ${Math.round(fileBuffer.length / 1024)} KB
Content: This is a PDF document that requires specialized text extraction tools.
Note: Full text extraction would require pdf-parse or similar library integration.`;

    } catch (error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract text from Word documents
   * Note: For production, consider using mammoth.js or similar
   * @param {string} filePath - Path to Word document
   * @returns {Promise<string>} Extracted text
   */
  async extractWordText(filePath) {
    // Placeholder - in production use mammoth.js or similar
    const stats = fs.statSync(filePath);
    return `Word Document: ${path.basename(filePath)}
File Size: ${Math.round(stats.size / 1024)} KB
Content: This is a Word document that requires specialized text extraction tools.
Note: Full text extraction would require mammoth.js or similar library integration.`;
  }

  /**
   * Generate AI-powered analysis of document content
   * @param {Object} document - KnowledgeDocument record
   * @param {string} extractedText - Extracted text content
   * @returns {Promise<Object>} AI analysis results
   */
  async generateAIAnalysis(document, extractedText) {
    const prompt = `
Analyze the following research document related to graphene production and materials science:

DOCUMENT METADATA:
- Title: ${document.title}
- Type: ${document.documentType}
- Category: ${document.documentCategory || 'Not specified'}
- Keywords: ${document.keywords?.join(', ') || 'None provided'}
- Authors: ${document.authors?.join(', ') || 'Not specified'}

EXTRACTED CONTENT:
${extractedText.substring(0, 4000)}${extractedText.length > 4000 ? '...[truncated]' : ''}

ANALYSIS TASKS:
1. TECHNICAL SUMMARY (2-3 paragraphs): Provide a comprehensive summary focusing on key technical content, methodologies, and findings relevant to graphene production from hemp biochar.

2. LAYMAN SUMMARY (1 paragraph): Explain the document's significance in simple terms that a non-technical person could understand.

3. KEY FINDINGS (3-5 bullet points): Extract the most important discoveries, conclusions, or recommendations that could impact graphene production optimization.

4. RELEVANCE ASSESSMENT: Rate the relevance to graphene production from hemp biochar on a scale of 1-10 and explain why.

5. RESEARCH AREAS: Identify primary research areas this document contributes to (choose from: biochar processing, graphene synthesis, material characterization, scaling methods, quality control, applications).

Format your response as JSON:
{
  "summary": "Technical summary here...",
  "laymanSummary": "Simple explanation here...",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "relevanceScore": 8.5,
  "relevanceReasoning": "Explanation of relevance...",
  "primaryResearchAreas": ["area1", "area2"]
}`;

    try {
      const response = await this._getClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert materials scientist and research analyst specializing in graphene production and hemp biochar processing. Analyze research documents and provide structured, technical insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      });

      const aiResponse = response.choices[0].message.content;
      
      // Parse JSON response
      try {
        const analysisResult = JSON.parse(aiResponse);
        return {
          summary: analysisResult.summary,
          laymanSummary: analysisResult.laymanSummary,
          keyFindings: analysisResult.keyFindings || [],
          relevanceScore: analysisResult.relevanceScore || 5.0,
          primaryResearchAreas: analysisResult.primaryResearchAreas || []
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          summary: aiResponse.substring(0, 1000),
          laymanSummary: "AI analysis available - see technical summary for details.",
          keyFindings: ["AI analysis completed"],
          relevanceScore: 5.0,
          primaryResearchAreas: ["general"]
        };
      }

    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        summary: `Document analysis in progress. Title: ${document.title}. Type: ${document.documentType}.`,
        laymanSummary: "This document is being processed for research insights.",
        keyFindings: ["Document uploaded successfully"],
        relevanceScore: 5.0,
        primaryResearchAreas: ["general"]
      };
    }
  }

  /**
   * Calculate relevance score based on document content and metadata
   * @param {Object} document - KnowledgeDocument record
   * @param {string} extractedText - Extracted text
   * @param {Object} aiAnalysis - AI analysis results
   * @returns {number} Relevance score (0-10)
   */
  calculateRelevanceScore(document, extractedText, aiAnalysis) {
    let score = aiAnalysis.relevanceScore || 5.0;

    // Boost score based on document type relevance
    const typeBoosts = {
      'RESEARCH_PAPER': 2.0,
      'PATENT': 1.8,
      'TECHNICAL_REPORT': 1.5,
      'WHITEPAPER': 1.3,
      'THESIS': 1.2
    };
    score += typeBoosts[document.documentType] || 0;

    // Boost based on category relevance
    const categoryBoosts = {
      'GRAPHENE_PRODUCTION': 2.0,
      'BIOCHAR_PROCESSING': 1.8,
      'MATERIAL_CHARACTERIZATION': 1.5,
      'SCALING_METHODS': 1.3
    };
    score += categoryBoosts[document.documentCategory] || 0;

    // Boost based on relevant keywords in content
    const relevantTerms = [
      'graphene', 'biochar', 'hemp', 'conductivity', 'bet', 'raman', 
      'surface area', 'carbon', 'material', 'synthesis', 'production'
    ];
    
    const lowerText = extractedText.toLowerCase();
    const termCount = relevantTerms.filter(term => lowerText.includes(term)).length;
    score += (termCount / relevantTerms.length) * 1.5;

    // Normalize to 0-10 scale
    return Math.min(Math.max(score, 0), 10);
  }

  /**
   * Update document processing status
   * @param {string} documentId - Document ID
   * @param {string} status - Processing status
   * @param {string|null} error - Error message if failed
   * @param {Object} prisma - Prisma client
   */
  async updateDocumentStatus(documentId, status, error, prisma) {
    const updateData = {
      processingStatus: status,
      lastProcessedAt: new Date()
    };

    if (error) {
      updateData.processingError = error;
    } else {
      updateData.processingError = null;
    }

    // Increment attempts count
    if (status === 'PROCESSING') {
      const document = await prisma.knowledgeDocument.findUnique({
        where: { id: documentId },
        select: { processingAttempts: true }
      });
      updateData.processingAttempts = (document?.processingAttempts || 0) + 1;
    }

    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: updateData
    });
  }

  /**
   * Process all pending documents in the knowledge base
   * @param {Object} prisma - Prisma client instance
   * @returns {Promise<Object>} Batch processing results
   */
  async processPendingDocuments(prisma) {
    try {
      const pendingDocuments = await prisma.knowledgeDocument.findMany({
        where: {
          processingStatus: 'PENDING',
          processingAttempts: { lt: this.maxRetries }
        },
        orderBy: { uploadedAt: 'asc' }
      });

      console.log(`Found ${pendingDocuments.length} pending documents to process`);

      const results = [];
      for (const document of pendingDocuments) {
        const result = await this.processDocument(document.id, prisma);
        results.push({
          documentId: document.id,
          title: document.title,
          ...result
        });

        // Add small delay between processing to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };

    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    }
  }

  /**
   * Reprocess a specific document (useful for retries or updates)
   * @param {string} documentId - Document ID to reprocess
   * @param {Object} prisma - Prisma client instance
   */
  async reprocessDocument(documentId, prisma) {
    // Reset processing status
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        processingStatus: 'PENDING',
        processingError: null
      }
    });

    // Process the document
    return await this.processDocument(documentId, prisma);
  }
}

export default new DocumentProcessingService();