const requestBuckets = new Map()

export const createRateLimiter = ({ windowMs = 60_000, max = 30 } = {}) => {
  return (req, res, next) => {
    const key = req.body?.userId || req.ip || 'anonymous'
    const now = Date.now()

    const bucket = requestBuckets.get(key)
    if (!bucket || now > bucket.resetAt) {
      requestBuckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    bucket.count += 1
    if (bucket.count > max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000)
      return res.status(429).json({
        success: false,
        message: `Too many requests. Retry in ${retryAfterSec}s`,
      })
    }

    return next()
  }
}
