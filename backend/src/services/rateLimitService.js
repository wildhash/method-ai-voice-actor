/**
 * Rate Limiting Service for Voice Synthesis
 * Implements a free tier with daily limits to protect API credits
 */

// Configuration
export const TIER_LIMITS = {
  FREE_DAILY_LIMIT: 10,        // Free requests per day per client
  FREE_CHAR_LIMIT: 500,        // Max characters per request for free tier
  WINDOW_MS: 24 * 60 * 60 * 1000  // 24 hours
};

// In-memory store (use Redis in production for multi-instance)
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
const cleanup = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanup, 60 * 60 * 1000);

/**
 * Get or create rate limit entry for a client
 */
const getEntry = (clientId) => {
  const now = Date.now();
  let entry = rateLimitStore.get(clientId);
  
  // Create new entry or reset if expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + TIER_LIMITS.WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(clientId, entry);
  }
  
  return entry;
};

/**
 * Check if a request is allowed under rate limits
 * @param {string} clientId - Unique client identifier (IP or custom ID)
 * @returns {Object} { allowed, remaining, resetTime }
 */
export const checkRateLimit = (clientId) => {
  const entry = getEntry(clientId);
  const remaining = Math.max(0, TIER_LIMITS.FREE_DAILY_LIMIT - entry.count);
  
  if (entry.count >= TIER_LIMITS.FREE_DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(clientId, entry);
  
  return {
    allowed: true,
    remaining: remaining - 1,
    resetTime: entry.resetTime
  };
};

/**
 * Get current rate limit status without incrementing
 */
export const getRateLimitStatus = (clientId, hasApiKey = false) => {
  if (hasApiKey) {
    return {
      tier: 'unlimited',
      remaining: Infinity,
      limit: Infinity,
      resetTime: null
    };
  }
  
  const entry = getEntry(clientId);
  return {
    tier: 'free',
    remaining: Math.max(0, TIER_LIMITS.FREE_DAILY_LIMIT - entry.count),
    limit: TIER_LIMITS.FREE_DAILY_LIMIT,
    resetTime: entry.resetTime,
    characterLimit: TIER_LIMITS.FREE_CHAR_LIMIT
  };
};

export default { checkRateLimit, getRateLimitStatus, TIER_LIMITS };
