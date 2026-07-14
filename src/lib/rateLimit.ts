// Simple in-process rate limiter.
//
// Works perfectly for single-server deployments.
// For Vercel serverless (multiple function instances), upgrade to Upstash Redis:
//   npm install @upstash/ratelimit @upstash/redis
//
// Usage:
//   const allowed = checkRateLimit(`booking:${ip}`, 20, 60 * 60 * 1000)
//   if (!allowed) return { success: false, error: 'Too many attempts.' }

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) return false

  entry.count++
  return true
}

// Periodically clean up expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000) // clean every 5 minutes
