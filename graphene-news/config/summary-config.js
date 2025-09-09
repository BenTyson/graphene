/**
 * Summary System Configuration
 * Centralized configuration for AI-powered article summarization
 */

export const SUMMARY_CONFIG = {
  // Cost controls
  MONTHLY_LIMIT: parseFloat(process.env.SUMMARY_MONTHLY_LIMIT || '30'), // USD
  DAILY_LIMIT: parseFloat(process.env.SUMMARY_DAILY_LIMIT || '5'), // USD
  PER_SUMMARY_LIMIT: 0.01, // Maximum cost per summary

  // Processing limits
  MAX_INPUT_TOKENS: parseInt(process.env.SUMMARY_MAX_TOKENS || '1000'),
  MAX_OUTPUT_TOKENS: parseInt(process.env.SUMMARY_OUTPUT_TOKENS || '150'),
  BATCH_SIZE: parseInt(process.env.SUMMARY_BATCH_SIZE || '10'),
  RATE_LIMIT_DELAY: 1000, // ms between API calls

  // Quality controls
  MIN_RELEVANCE_SCORE: 5.0, // Only summarize high-relevance articles
  HIGH_IMPACT_KEYWORDS: [
    'hemp', 'supercapacitor', 'supercapacitors', 
    'energy storage', 'cathode', 'anode', 'electrode',
    'electrochemical', 'capacitor', 'battery storage'
  ],

  // OpenAI settings
  MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  TEMPERATURE: 0.3, // Lower = more consistent
  MAX_RETRIES: 2,
  TIMEOUT: 30000, // 30 seconds

  // Feature flags
  ENABLED: process.env.SUMMARY_ENABLED === 'true',
  AUTO_GENERATE: process.env.SUMMARY_AUTO_GENERATE !== 'false', // Default true
  SHOW_COSTS_IN_UI: process.env.NODE_ENV === 'development',

  // Scheduling
  BATCH_SCHEDULE: '0 1 * * *', // Daily at 1 AM
  CLEANUP_SCHEDULE: '0 0 * * 0', // Weekly on Sunday
  RESET_USAGE_SCHEDULE: '0 0 1 * *', // Monthly on 1st

  // Monitoring
  LOG_ALL_REQUESTS: process.env.NODE_ENV === 'development',
  ALERT_THRESHOLD: 0.8, // Alert when 80% of budget used
  
  // Cache settings
  CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  ERROR_RETRY_DELAY: 24 * 60 * 60 * 1000, // 24 hours before retrying failed summaries
};

export const COST_RATES = {
  // GPT-4o-mini rates (per 1M tokens)
  'gpt-4o-mini': {
    input: 0.00015,  // $0.15 per 1M input tokens
    output: 0.0006   // $0.60 per 1M output tokens
  },
  // Future model rates can be added here
};

export const PROMPT_CATEGORIES = {
  RESEARCH_BREAKTHROUGH: 'research',
  MARKET_ANALYSIS: 'market',
  PATENTS: 'patent',
  COMPANY_NEWS: 'company',
  APPLICATIONS: 'application',
  PRODUCTION_METHODS: 'production',
  INDUSTRY_NEWS: 'general',
  FUNDING_INVESTMENT: 'funding'
};

/**
 * Calculate estimated cost for a summary request
 */
export function estimateCost(inputTokens, outputTokens, model = SUMMARY_CONFIG.MODEL) {
  const rates = COST_RATES[model] || COST_RATES['gpt-4o-mini'];
  return (inputTokens * rates.input / 1000000) + (outputTokens * rates.output / 1000000);
}

/**
 * Check if summary generation should proceed based on limits
 */
export function shouldGenerateSummary(currentUsage, estimatedCost) {
  // Check monthly limit
  if (currentUsage.monthlyCost + estimatedCost > SUMMARY_CONFIG.MONTHLY_LIMIT) {
    return { allowed: false, reason: 'Monthly limit exceeded' };
  }

  // Check daily limit
  if (currentUsage.dailyCost + estimatedCost > SUMMARY_CONFIG.DAILY_LIMIT) {
    return { allowed: false, reason: 'Daily limit exceeded' };
  }

  // Check per-summary limit
  if (estimatedCost > SUMMARY_CONFIG.PER_SUMMARY_LIMIT) {
    return { allowed: false, reason: 'Per-summary cost limit exceeded' };
  }

  return { allowed: true };
}

/**
 * Get usage statistics formatted for display
 */
export function formatUsageStats(usage) {
  return {
    monthly: {
      cost: usage.monthlyCost?.toFixed(4) || '0.0000',
      percentage: ((usage.monthlyCost / SUMMARY_CONFIG.MONTHLY_LIMIT) * 100).toFixed(1),
      remaining: (SUMMARY_CONFIG.MONTHLY_LIMIT - usage.monthlyCost).toFixed(2)
    },
    daily: {
      cost: usage.dailyCost?.toFixed(4) || '0.0000',
      percentage: ((usage.dailyCost / SUMMARY_CONFIG.DAILY_LIMIT) * 100).toFixed(1),
      remaining: (SUMMARY_CONFIG.DAILY_LIMIT - usage.dailyCost).toFixed(2)
    },
    tokens: {
      input: usage.inputTokens || 0,
      output: usage.outputTokens || 0,
      total: (usage.inputTokens || 0) + (usage.outputTokens || 0)
    }
  };
}