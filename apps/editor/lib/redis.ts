import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

const globalForRedis = global as unknown as { redis: Redis }

function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(redisUrl)
  }
  return globalForRedis.redis
}

// Lazy proxy — Redis client is only created on first property access
export const redis = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    const instance = getRedis()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
