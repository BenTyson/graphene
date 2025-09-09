/**
 * SummaryToggle Component
 * Handles display and generation of layman summaries for articles
 */

export function getSummaryToggleHtml(article) {
  // Check if summary exists
  const hasSummary = article.laymanSummary && article.summaryGenerated;
  const hasError = article.summaryError && !article.summaryGenerated;
  
  // Get simplified title here in the function
  const simplifiedTitle = getSimplifiedTitle(article.title);
  
  return `
    <div class="summary-toggle-container mt-4" data-article-id="${article.id}">
      <!-- Summary Toggle Button -->
      <div class="flex items-center justify-between mb-3">
        <button 
          @click="toggleSummaryDisplay('${article.id}')"
          class="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black transition-colors">
          <svg 
            :class="showSummary['${article.id}'] ? 'rotate-90' : ''" 
            class="w-4 h-4 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span>Business Summary</span>
            ${hasSummary ? '<span class="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Ready</span>' : ''}
            ${hasError ? '<span class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Error</span>' : ''}
            ${!hasSummary && !hasError ? '<span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Generate</span>' : ''}
          </span>
        </button>
        
        ${!hasSummary && !hasError ? `
          <button 
            @click="generateSummary('${article.id}')"
            :disabled="summaryLoading['${article.id}']"
            :class="summaryLoading['${article.id}'] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'"
            class="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 transition-colors">
            <svg 
              x-show="!summaryLoading['${article.id}']" 
              class="w-3 h-3 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <div 
              x-show="summaryLoading['${article.id}']" 
              x-cloak 
              class="animate-spin w-3 h-3 mr-1 border border-blue-600 border-t-transparent rounded-full"></div>
            <span x-text="summaryLoading['${article.id}'] ? 'Generating...' : 'Generate'"></span>
          </button>
        ` : ''}
      </div>

      <!-- Summary Content -->
      <div 
        x-show="showSummary['${article.id}']" 
        x-collapse
        class="summary-content bg-gray-50 border border-gray-200 rounded-lg p-4">
        
        ${hasSummary ? `
          <!-- Existing Summary -->
          <div class="space-y-3">
            <div class="mb-4">
              <h4 class="text-base font-medium text-gray-600 mb-2">What This Article Means:</h4>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">${simplifiedTitle}</h3>
            </div>
            <div class="space-y-4">
              ${formatSummaryWithSections(article.laymanSummary || 'Summary not available')}
            </div>
            <div class="flex items-center justify-end pt-3 border-t border-gray-200">
              <button 
                @click="regenerateSummary('${article.id}')"
                class="text-black hover:text-gray-700 text-xs font-medium">
                Regenerate
              </button>
            </div>
          </div>
        ` : hasError ? `
          <!-- Error State -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2 text-sm text-red-700">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-semibold">Summary Generation Failed</span>
            </div>
            <div class="text-sm text-red-700 bg-red-100 p-3 rounded">
              <p class="font-medium">Error:</p>
              <p>${article.summaryError || 'Unknown error occurred'}</p>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span class="text-xs text-gray-500">This may be due to API limits or content restrictions</span>
              <button 
                @click="retryGenerateSummary('${article.id}')"
                class="text-black hover:text-gray-700 text-xs font-medium">
                Try Again
              </button>
            </div>
          </div>
        ` : `
          <!-- Loading/Generate State -->
          <div x-show="!summaryLoading['${article.id}']" class="text-center py-6">
            <div class="space-y-3">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <p class="text-sm text-gray-600">Click "Generate" to create a business-friendly summary</p>
              <p class="text-xs text-gray-500">AI will explain this article in simple business terms</p>
            </div>
          </div>
          
          <div x-show="summaryLoading['${article.id}']" x-cloak class="text-center py-6">
            <div class="space-y-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p class="text-sm text-gray-600">Generating business summary...</p>
              <p class="text-xs text-gray-500">This may take 10-30 seconds</p>
            </div>
          </div>
        `}
      </div>

      <!-- Cost Information (for admin/development) -->
      ${window.location.hostname === 'localhost' ? `
        <div x-show="showSummary['${article.id}'] && ${hasSummary}" class="mt-2 text-xs text-gray-400">
          Estimated cost: ~$0.002 • Optimized for business insights
        </div>
      ` : ''}
    </div>
  `;
}

// Helper function to check if article should show summary toggle
export function shouldShowSummaryToggle(article) {
  // Show for high-relevance articles or those with existing summaries
  // Temporarily lowered threshold for testing (was 5.0)
  return (
    article.summaryGenerated || 
    parseFloat(article.relevanceScore) >= 0 ||
    (article.keywordTags && article.keywordTags.some(tag => 
      ['hemp', 'supercapacitor', 'supercapacitors', 'energy storage', 'cathode', 'anode', 'electrode']
        .some(keyword => tag.toLowerCase().includes(keyword))
    ))
  );
}

// Format summary text with clean section headers
export function formatSummaryWithSections(summaryText) {
  if (!summaryText || summaryText === 'Summary not available') {
    return '<p class="text-gray-700 leading-relaxed">Summary not available</p>';
  }

  // First, strip all markdown formatting
  let cleanText = summaryText
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
    .replace(/__(.*?)__/g, '$1')     // Remove __underline__ formatting
    .trim();

  // Try to detect markdown-style headers like **Key Development:**
  const markdownSections = cleanText.split(/(?=(?:Key Development|Why It Matters|Business Impact|Timeline|Market Opportunity|Strategic Relevance|Opportunities|Risks|Industry Implications|Connection to|What|How|When|Where|Why).*?:)/i);
  
  if (markdownSections.length > 1) {
    let formattedHtml = '';
    
    markdownSections.forEach((section, index) => {
      if (!section.trim()) return;
      
      // Extract header and content
      const headerMatch = section.trim().match(/^([^:]+):\s*(.*)$/s);
      if (headerMatch) {
        const [, rawHeader, content] = headerMatch;
        
        // Clean and map headers to our standard ones
        const headerMappings = {
          'key development': 'Key Development',
          'why it matters': 'Business Impact',
          'business impact': 'Business Impact',
          'opportunities': 'Market Opportunity',
          'risks': 'Risks & Considerations',
          'opportunities/risks': 'Opportunities & Risks',
          'industry implications': 'Strategic Relevance',
          'connection to': 'Strategic Relevance',
          'timeline': 'Timeline & Implementation',
          'market opportunity': 'Market Opportunity'
        };
        
        const cleanHeader = rawHeader.toLowerCase().trim();
        const displayHeader = headerMappings[cleanHeader] || 
                            rawHeader.replace(/[^\w\s]/g, '').trim();
        
        if (content.trim()) {
          formattedHtml += `
            <div class="mb-6">
              <h5 class="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b border-gray-200">${displayHeader}</h5>
              <p class="text-gray-700 leading-relaxed">${content.trim()}</p>
            </div>
          `;
        }
      } else if (index === 0 && section.trim()) {
        // Handle intro text without headers
        formattedHtml += `<p class="text-gray-700 leading-relaxed mb-4">${section.trim()}</p>`;
      }
    });
    
    if (formattedHtml) return formattedHtml;
  }

  // Fallback: Try numbered sections (1., 2., 3., etc.)
  const numberedSections = cleanText.split(/(?=\d+\.\s)/);
  
  if (numberedSections.length > 1) {
    let formattedHtml = '';
    
    numberedSections.forEach((section, index) => {
      if (!section.trim()) return;
      
      const match = section.trim().match(/^(\d+)\.\s*(.+)$/s);
      if (match) {
        const [, number, content] = match;
        
        const sectionTitles = {
          '1': 'Key Development',
          '2': 'Business Impact', 
          '3': 'Timeline & Implementation',
          '4': 'Market Opportunity',
          '5': 'Strategic Relevance'
        };
        
        const title = sectionTitles[number] || `Section ${number}`;
        
        formattedHtml += `
          <div class="mb-6">
            <h5 class="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b border-gray-200">${title}</h5>
            <p class="text-gray-700 leading-relaxed">${content.trim()}</p>
          </div>
        `;
      }
    });
    
    if (formattedHtml) return formattedHtml;
  }

  // Final fallback: return as single paragraph (stripped of markdown)
  return `<p class="text-gray-700 leading-relaxed">${cleanText}</p>`;
}

// Simplify complex article titles for layman understanding
export function getSimplifiedTitle(originalTitle) {
  if (!originalTitle) return 'Article Summary';

  let simplified = originalTitle.toLowerCase();

  // Aggressive simplifications - translate scientific concepts to everyday language
  const translations = {
    // Materials & Chemistry
    'molecular extrusion': 'new manufacturing process',
    'polymer dynamic soft encapsulation': 'plastic coating',
    'perovskite solar cells': 'advanced solar panels',
    'inverted perovskite': 'improved solar panels',
    'lead leakage': 'toxic lead escaping',
    'inhibit': 'prevent',
    'encapsulation': 'protective coating',
    
    // Energy & Electronics
    'supercapacitor': 'energy storage device',
    'electrochemical': 'electrical',
    'cathode': 'battery part',
    'anode': 'battery part', 
    'electrode': 'electrical contact',
    'lithium metal batteries': 'advanced batteries',
    'energy storage': 'power storage',
    'semiconductor': 'computer chip material',
    
    // Medical & Biology
    'biofabrication': 'artificial tissue creation',
    'vascularization': 'blood vessel growth',
    'blood-brain barrier': 'brain protection system',
    'neuroprotection': 'brain protection',
    'ischemic stroke': 'blocked blood vessel stroke',
    'inflammatory receptor': 'immune system target',
    
    // General Science
    'heteroaromatic': 'chemical compound',
    'polycyclic': 'ring-shaped molecule',
    'polyamide': 'plastic material',
    'phase behaviour': 'how materials behave',
    'singlet-triplet': 'energy state',
    'emitters': 'light sources',
    'organic semiconductors': 'plastic electronics',
    'interphase': 'boundary layer',
    
    // Process words
    'utilizing': 'using',
    'enhanced': 'improved',
    'optimization': 'improvement',
    'fabrication': 'manufacturing',
    'synthesis': 'creation',
    'characterization': 'testing',
    'demonstrate': 'show',
    'investigate': 'study',
    'novel': 'new',
    'efficient': 'effective'
  };

  // Apply translations
  Object.entries(translations).forEach(([scientific, simple]) => {
    const regex = new RegExp(scientific, 'gi');
    simplified = simplified.replace(regex, simple);
  });

  // Remove technical jargon patterns
  simplified = simplified
    .replace(/:\s*.+$/, '') // Remove subtitle after colon
    .replace(/\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\b\d+[a-z]*\b/g, '') // Remove technical numbers/codes
    .replace(/\b[a-z]{1,3}-\d+\b/gi, '') // Remove chemical codes
    .replace(/\bvia\b/gi, 'using') // Replace "via"
    .replace(/\bfor\s+(efficient|effective|improved|enhanced|optimal)\b/gi, 'to make better')
    .replace(/\bto\s+(enhance|improve|optimize|increase)\b/gi, 'to improve')
    .replace(/\band\s+modules?\b/gi, '') // Remove "and modules"
    .replace(/\s+/g, ' ') // Clean up extra spaces
    .trim();

  // Smart truncation - keep the most important words (usually action + object)
  const words = simplified.split(' ').filter(word => word.length > 0);
  
  // Try to extract the core meaning
  let coreWords = [];
  let hasAction = false;
  
  // Look for key action words and objects
  const actionWords = ['prevent', 'improve', 'create', 'develop', 'make', 'build', 'design', 'using', 'new'];
  const objectWords = ['solar', 'battery', 'device', 'material', 'coating', 'system', 'panel', 'storage', 'protection'];
  
  words.forEach(word => {
    if (actionWords.some(action => word.includes(action)) && !hasAction) {
      coreWords.push(word);
      hasAction = true;
    } else if (objectWords.some(obj => word.includes(obj))) {
      coreWords.push(word);
    } else if (coreWords.length < 6 && word.length > 3) {
      coreWords.push(word);
    }
  });

  // Fall back to first important words if core extraction fails
  if (coreWords.length < 3) {
    coreWords = words.slice(0, 6);
  }

  // Limit to reasonable length
  if (coreWords.length > 8) {
    coreWords = coreWords.slice(0, 8);
  }

  // Capitalize and join
  simplified = coreWords
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Final cleanup and validation
  if (simplified.length < 10 || simplified.length > 100) {
    // Emergency fallback - extract key concepts
    const keyTerms = originalTitle.match(/(?:solar|battery|energy|material|device|system|method|new|improved|enhanced|efficient)/gi);
    if (keyTerms && keyTerms.length > 0) {
      simplified = `New ${keyTerms[0].toLowerCase()} research`;
      simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);
    } else {
      simplified = 'New Research Development';
    }
  }

  return simplified;
}