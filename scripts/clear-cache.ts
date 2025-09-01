import { redis } from "@/lib/redis";

async function clearCache() {
  try {
    console.log("🧹 Clearing Redis cache...");

    await redis.flushall();

    console.log("✅ Redis cache cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
  } finally {
    await redis.disconnect();
  }
}

clearCache();
