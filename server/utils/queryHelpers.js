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

/**
 * Parse filter parameters from query string
 * @param {object} query - Express request query object
 * @returns {object} Parsed filters object
 */
export function parseFilters(query) {
  const filters = {};
  
  if (query.filters) {
    try {
      // Handle JSON string filters
      if (typeof query.filters === 'string') {
        return JSON.parse(query.filters);
      }
      // Handle already parsed object
      if (typeof query.filters === 'object') {
        return query.filters;
      }
    } catch (error) {
      console.warn('Error parsing filters:', error);
      return {};
    }
  }
  
  // Handle individual filter parameters (legacy support)
  Object.keys(query).forEach(key => {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '');
      filters[filterKey] = query[key];
    }
  });
  
  return filters;
}

/**
 * Parse pagination parameters from query
 * @param {object} query - Express request query object
 * @returns {object} Pagination parameters
 */
export function parsePagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 500); // Cap at 500
  
  return { page, limit };
}

/**
 * Parse sort parameters from query
 * @param {object} query - Express request query object
 * @returns {object} Sort parameters
 */
export function parseSort(query) {
  const sortBy = query.sortBy || query.sort || 'createdAt';
  const order = (query.order || query.dir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  
  return { sortBy, order };
}

/**
 * Build complete query options from request
 * @param {object} req - Express request object
 * @param {string} tableName - Name of the table being queried
 * @returns {object} Complete query options
 */
export function buildQueryOptions(req, tableName) {
  const { query } = req;
  
  return {
    filters: parseFilters(query),
    search: query.search || query.q || '',
    pagination: parsePagination(query),
    sort: parseSort(query),
    tableName
  };
}

/**
 * Build metadata for filtered responses
 * @param {number} totalCount - Total number of records (before pagination)
 * @param {number} filteredCount - Number of filtered records
 * @param {object} pagination - Pagination parameters
 * @param {object} filters - Applied filters
 * @returns {object} Response metadata
 */
export function buildResponseMeta(totalCount, filteredCount, pagination, filters = {}) {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(filteredCount / limit);
  
  return {
    pagination: {
      page,
      limit,
      total: filteredCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: {
      applied: Object.keys(filters).length > 0,
      count: Object.keys(filters).length,
      activeFilters: filters
    },
    stats: {
      totalRecords: totalCount,
      filteredRecords: filteredCount,
      hiddenRecords: totalCount - filteredCount
    }
  };
}

/**
 * Validate filter parameters
 * @param {object} filters - Filter object to validate
 * @param {string} tableName - Name of the table
 * @returns {object} Validation result with errors if any
 */
export function validateFilters(filters, tableName) {
  const errors = [];
  
  if (!filters || typeof filters !== 'object') {
    return { valid: true, errors: [] };
  }
  
  // Add specific validation logic here based on filter types
  Object.entries(filters).forEach(([key, value]) => {
    // Date validation
    if (key.includes('Date') && value) {
      if (typeof value === 'object') {
        if (value.from && isNaN(Date.parse(value.from))) {
          errors.push(`Invalid 'from' date in ${key}: ${value.from}`);
        }
        if (value.to && isNaN(Date.parse(value.to))) {
          errors.push(`Invalid 'to' date in ${key}: ${value.to}`);
        }
      }
    }
    
    // Numeric validation
    if (key.includes('Range') && value) {
      if (typeof value === 'object') {
        if (value.min !== undefined && isNaN(parseFloat(value.min))) {
          errors.push(`Invalid minimum value in ${key}: ${value.min}`);
        }
        if (value.max !== undefined && isNaN(parseFloat(value.max))) {
          errors.push(`Invalid maximum value in ${key}: ${value.max}`);
        }
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}