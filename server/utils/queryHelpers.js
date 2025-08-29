/**
 * Build search query conditions for Prisma
 * @param {string[]} searchFields - Array of field names to search
 * @param {string} searchTerm - Search term
 * @returns {object} Prisma where condition
 */
export function buildSearchQuery(searchFields, searchTerm) {
  if (!searchTerm || !searchFields.length) {
    return {};
  }

  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    }))
  };
}

/**
 * Build orderBy clause for Prisma queries
 * @param {string} sortBy - Field to sort by
 * @param {string} order - 'asc' or 'desc' 
 * @param {object} sortMappings - Map of sort keys to actual field names
 * @returns {object} Prisma orderBy clause
 */
export function buildOrderBy(sortBy = 'chronological', order = 'desc', sortMappings = {}) {
  const orderDirection = order === 'asc' ? 'asc' : 'desc';
  
  // Use custom mappings or default to the sortBy field
  const sortField = sortMappings[sortBy] || sortBy;
  
  // Default chronological sorting
  if (sortBy === 'chronological') {
    return { createdAt: orderDirection };
  }
  
  return { [sortField]: orderDirection };
}

/**
 * Build pagination options for Prisma
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {object} Prisma skip and take options
 */
export function buildPagination(page, limit = 20) {
  if (!page || page < 1) {
    return {};
  }
  
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Standardized response format
 * @param {any} data - Response data
 * @param {object} meta - Metadata (pagination, totals, etc.)
 * @returns {object} Formatted response
 */
export function formatResponse(data, meta = {}) {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString()
  };
}

/**
 * Error response format
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Additional error details
 * @returns {object} Formatted error response
 */
export function formatErrorResponse(message, statusCode = 500, details = null) {
  return {
    success: false,
    error: {
      message,
      statusCode,
      details
    },
    timestamp: new Date().toISOString()
  };
}