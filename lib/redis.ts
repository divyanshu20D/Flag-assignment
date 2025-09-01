import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL!)

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Cache keys
export const CACHE_KEYS = {
    FLAG: (workspaceId: string, key: string) => `flag:${workspaceId}:${key}`,
    FLAGS: (workspaceId: string) => `flags:${workspaceId}`,
} as const