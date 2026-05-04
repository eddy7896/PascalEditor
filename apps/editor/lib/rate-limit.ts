// Rate limiting using ioredis atomic Lua script (fixed window).
// Source: https://redis.io/tutorials/howtos/ratelimiting/
// IMPORTANT: This file must only be imported in Node.js route handlers.
// Do NOT import in middleware.ts — ioredis is not compatible with Edge Runtime.

import { redis } from './redis'

const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local count = redis.call('INCR', key)
  if count == 1 then
    redis.call('EXPIRE', key, window)
  end
  return count
`

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  count: number
}

/**
 * rateLimit — check and increment a rate limit counter.
 *
 * @param key       Redis key, include endpoint prefix and IP: e.g. 'rl:login:1.2.3.4'
 * @param limit     Max requests allowed per window
 * @param windowSec Window size in seconds (TTL reset on first hit)
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const count = (await redis.eval(RATE_LIMIT_SCRIPT, 1, key, String(limit), String(windowSec))) as number
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    count,
  }
}
