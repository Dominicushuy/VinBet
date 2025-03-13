// src/utils/rateLimit.js
export const rateLimit = ({ interval, uniqueTokenPerInterval = 500 }) => {
  const tokenCache = new Map()
  const tokenCounts = new Map()
  let lastIntervalStart = Date.now()

  return {
    check: async (limit, token) => {
      // Clear cache when interval is passed
      const now = Date.now()
      if (now - lastIntervalStart >= interval) {
        tokenCache.clear()
        tokenCounts.clear()
        lastIntervalStart = now
      }

      // Create token hash
      const tokenHash = `${token}-${Math.floor(now / interval)}`

      // Check if the token is in cache
      if (!tokenCache.has(tokenHash)) {
        // Set initial count
        tokenCache.set(tokenHash, 0)
      }

      // Increment the token count
      tokenCache.set(tokenHash, tokenCache.get(tokenHash) + 1)

      // Check if the limit is exceeded
      const currentTokenUsage = tokenCache.get(tokenHash)

      if (currentTokenUsage > limit) {
        throw new Error('Rate limit exceeded')
      }

      // Track the total number of tokens
      const totalTokens = tokenCounts.get(tokenHash) || 0
      tokenCounts.set(tokenHash, totalTokens + 1)

      // Return remaining tokens
      return {
        limit,
        remaining: Math.max(0, limit - currentTokenUsage)
      }
    }
  }
}
