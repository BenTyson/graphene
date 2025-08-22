// Objective Parser Utility
// Parses structured experiment objective text into separate fields

/**
 * Parse experiment objective text into structured data
 * @param {string} text - The pasted text containing objective, details, result, etc.
 * @returns {Object} Parsed fields or null if parsing fails
 */
export function parseObjectiveText(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Initialize result object
  const parsed = {
    objective: '',
    experimentDetails: '',
    result: '',
    conclusion: '',
    recommendedAction: ''
  };

  // Define patterns for each section
  // These patterns look for the section header followed by content
  const patterns = {
    objective: /(?:^|\n)(?:Objective|OBJECTIVE):?\s*([^\n]+(?:\n(?!(?:Experiment|Result|Conclusion|Recommended)[:\s]).*)*)/i,
    experimentDetails: /(?:^|\n)(?:Experiment\s*details?|EXPERIMENT\s*DETAILS?):?\s*([\s\S]*?)(?=\n(?:Result|Conclusion|Recommended)[:\s]|$)/i,
    result: /(?:^|\n)(?:Result|RESULT):?\s*([\s\S]*?)(?=\n(?:Conclusion|Recommended)[:\s]|$)/i,
    conclusion: /(?:^|\n)(?:Conclusion|CONCLUSION):?\s*([\s\S]*?)(?=\n(?:Recommended)[:\s]|$)/i,
    recommendedAction: /(?:^|\n)(?:Recommended\s*action|RECOMMENDED\s*ACTION):?\s*([\s\S]*?)$/i
  };

  // Try to extract each section
  for (const [field, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up the extracted text
      parsed[field] = match[1]
        .trim()
        .replace(/\n\s+/g, '\n') // Remove excessive indentation
        .replace(/\n{3,}/g, '\n\n'); // Limit multiple newlines to max 2
    }
  }

  // If we didn't find any structured sections, try a simpler approach
  // Look for lines that start with known headers
  if (!parsed.objective && !parsed.experimentDetails && !parsed.result) {
    const lines = text.split('\n');
    let currentSection = null;
    let sectionContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line starts a new section
      if (/^Objective:?/i.test(trimmedLine)) {
        if (currentSection) {
          parsed[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = 'objective';
        sectionContent = [trimmedLine.replace(/^Objective:?\s*/i, '')];
      } else if (/^Experiment\s*details?:?/i.test(trimmedLine)) {
        if (currentSection) {
          parsed[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = 'experimentDetails';
        sectionContent = [trimmedLine.replace(/^Experiment\s*details?:?\s*/i, '')];
      } else if (/^Result:?/i.test(trimmedLine)) {
        if (currentSection) {
          parsed[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = 'result';
        sectionContent = [trimmedLine.replace(/^Result:?\s*/i, '')];
      } else if (/^Conclusion:?/i.test(trimmedLine)) {
        if (currentSection) {
          parsed[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = 'conclusion';
        sectionContent = [trimmedLine.replace(/^Conclusion:?\s*/i, '')];
      } else if (/^Recommended\s*action:?/i.test(trimmedLine)) {
        if (currentSection) {
          parsed[currentSection] = sectionContent.join('\n').trim();
        }
        currentSection = 'recommendedAction';
        sectionContent = [trimmedLine.replace(/^Recommended\s*action:?\s*/i, '')];
      } else if (currentSection && trimmedLine) {
        // Add to current section
        sectionContent.push(line);
      }
    }
    
    // Save the last section
    if (currentSection) {
      parsed[currentSection] = sectionContent.join('\n').trim();
    }
  }

  // Check if we parsed anything meaningful
  const hasContent = Object.values(parsed).some(value => value && value.length > 0);
  
  return hasContent ? parsed : null;
}

/**
 * Format parsed objective data for display
 * @param {Object} data - Parsed objective data
 * @returns {string} HTML formatted string
 */
export function formatObjectiveDisplay(data) {
  if (!data) return '';

  const sections = [
    { label: 'Objective', value: data.objective },
    { label: 'Experiment Details', value: data.experimentDetails },
    { label: 'Result', value: data.result },
    { label: 'Conclusion', value: data.conclusion },
    { label: 'Recommended Action', value: data.recommendedAction }
  ];

  return sections
    .filter(section => section.value)
    .map(section => `
      <div class="mb-3">
        <h5 class="font-semibold text-sm text-gray-700">${section.label}:</h5>
        <p class="text-sm text-gray-600 whitespace-pre-wrap">${section.value}</p>
      </div>
    `)
    .join('');
}

export default {
  parseObjectiveText,
  formatObjectiveDisplay
};