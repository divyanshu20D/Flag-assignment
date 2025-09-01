import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisPub: Redis | undefined;
  redisSub: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL!);
export const redisPub =
  globalForRedis.redisPub ?? new Redis(process.env.REDIS_URL!);
export const redisSub =
  globalForRedis.redisSub ?? new Redis(process.env.REDIS_URL!);

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
  globalForRedis.redisSub = redisSub;
}

export const CACHE_KEYS = {
  FLAG: (key: string) => `flag:${key}`,
  FLAGS: () => `flags`,
} as const;

export const CHANNELS = {
  FLAG_EVENTS: () => `flag_events`,
} as const;

export type FlagEventType = "flag_created" | "flag_updated" | "flag_deleted";

export interface FlagEvent {
  type: FlagEventType;
  flag: {
    key: string;
    defaultValue: boolean;
    enabled: boolean;
    updatedAt: string;
    rules: any[];
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  timestamp: string;
  changes?: {
    enabled?: { from: boolean; to: boolean };
    defaultValue?: { from: boolean; to: boolean };
    rules?: { from: any[]; to: any[] };
  };
}

export async function publishFlagEvent(event: FlagEvent) {
  try {
    await redisPub.publish(CHANNELS.FLAG_EVENTS(), JSON.stringify(event));
  } catch (error) {
    console.error("Failed to publish flag event:", error);
  }
}
