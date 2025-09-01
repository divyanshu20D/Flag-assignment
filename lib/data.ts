import { prisma } from "./prisma";
import { redis, CACHE_KEYS, publishFlagEvent, type FlagEvent } from "./redis";
import { Comparator } from "@prisma/client";
import type { Flag, AuditLog } from "./types";

export async function listFlags(): Promise<Flag[]> {
  // Try cache first
  const cached = await redis.get(CACHE_KEYS.FLAGS());
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const dbFlags = await prisma.flag.findMany({
    include: { rules: true },
    orderBy: { key: "asc" },
  });

  // Transform to match our Flag type
  const flags: Flag[] = dbFlags.map((flag) => ({
    key: flag.key,
    defaultValue: flag.defaultValue,
    enabled: flag.enabled,
    updatedAt: flag.updatedAt.toISOString(),
    rules: flag.rules.map((rule) => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? "eq" : "in",
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  }));

  // Cache for 5 minutes
  await redis.setex(CACHE_KEYS.FLAGS(), 300, JSON.stringify(flags));

  return flags;
}

export async function getFlag(key: string): Promise<Flag | undefined> {
  // Try cache first
  const cached = await redis.get(CACHE_KEYS.FLAG(key));
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const dbFlag = await prisma.flag.findUnique({
    where: { key },
    include: { rules: true },
  });

  if (!dbFlag) return undefined;

  // Transform to match our Flag type
  const flag: Flag = {
    key: dbFlag.key,
    defaultValue: dbFlag.defaultValue,
    enabled: dbFlag.enabled,
    updatedAt: dbFlag.updatedAt.toISOString(),
    rules: dbFlag.rules.map((rule) => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? "eq" : "in",
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  };

  // Cache for 5 minutes
  await redis.setex(CACHE_KEYS.FLAG(key), 300, JSON.stringify(flag));

  return flag;
}

export async function upsertFlag(next: Flag, userId: string): Promise<Flag> {
  // Check if flag exists
  const existing = await prisma.flag.findUnique({
    where: { key: next.key },
    include: { rules: true },
  });

  const isUpdate = !!existing;

  // Track changes for real-time events
  const changes: FlagEvent["changes"] = {};
  if (existing) {
    if (existing.enabled !== next.enabled) {
      changes.enabled = { from: existing.enabled, to: next.enabled };
    }
    if (existing.defaultValue !== next.defaultValue) {
      changes.defaultValue = {
        from: existing.defaultValue,
        to: next.defaultValue,
      };
    }
    // Compare rules (simplified comparison)
    const existingRules = existing.rules.map((r) => ({
      attribute: r.attribute,
      comparator: r.comparator === Comparator.EQUALS ? "eq" : "in",
      value: r.value,
      rollout: r.rolloutPercentage,
    }));
    if (JSON.stringify(existingRules) !== JSON.stringify(next.rules)) {
      changes.rules = { from: existingRules, to: next.rules };
    }
  }

  // Upsert flag with rules
  const dbFlag = await prisma.flag.upsert({
    where: { key: next.key },
    update: {
      defaultValue: next.defaultValue,
      enabled: next.enabled,
      rules: {
        deleteMany: {},
        create: next.rules.map((rule) => ({
          attribute: rule.attribute,
          comparator:
            rule.comparator === "eq" ? Comparator.EQUALS : Comparator.IN,
          value: rule.value,
          rolloutPercentage: rule.rollout,
        })),
      },
    },
    create: {
      key: next.key,
      defaultValue: next.defaultValue,
      enabled: next.enabled,
      rules: {
        create: next.rules.map((rule) => ({
          attribute: rule.attribute,
          comparator:
            rule.comparator === "eq" ? Comparator.EQUALS : Comparator.IN,
          value: rule.value,
          rolloutPercentage: rule.rollout,
        })),
      },
    },
    include: { rules: true },
  });

  // Get user details for event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  // Create single audit log entry
  await prisma.auditLog.create({
    data: {
      action: isUpdate ? "Updated" : "Created",
      flagKey: next.key,
      userId,
    },
  });

  // Clear cache
  await redis.del(CACHE_KEYS.FLAG(next.key));
  await redis.del(CACHE_KEYS.FLAGS());

  // Transform to match our Flag type
  const flag: Flag = {
    key: dbFlag.key,
    defaultValue: dbFlag.defaultValue,
    enabled: dbFlag.enabled,
    updatedAt: dbFlag.updatedAt.toISOString(),
    rules: dbFlag.rules.map((rule) => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? "eq" : "in",
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  };

  // Publish real-time event
  if (user) {
    const event: FlagEvent = {
      type: isUpdate ? "flag_updated" : "flag_created",
      flag: flag,
      user: {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email,
        role: user.role,
      },
      changes,
      timestamp: new Date().toISOString(),
    };

    await publishFlagEvent(event);
  }

  return flag;
}

export async function deleteFlag(
  key: string,
  userId: string
): Promise<boolean> {
  // Check if flag exists
  const existing = await prisma.flag.findUnique({
    where: { key },
    include: { rules: true },
  });

  if (!existing) return false;

  // Get user details for event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  // Create audit log BEFORE deleting the flag
  await prisma.auditLog.create({
    data: {
      action: "Deleted",
      flagKey: key,
      userId,
    },
  });

  // Delete flag (rules will be deleted automatically due to CASCADE)
  await prisma.flag.delete({
    where: { key },
  });

  // Clear cache
  await redis.del(CACHE_KEYS.FLAG(key));
  await redis.del(CACHE_KEYS.FLAGS());

  // Publish real-time event
  if (user) {
    const event: FlagEvent = {
      type: "flag_deleted",
      flag: {
        key: existing.key,
        defaultValue: existing.defaultValue,
        enabled: existing.enabled,
        updatedAt: existing.updatedAt.toISOString(),
        rules: existing.rules.map((rule) => ({
          id: rule.id,
          attribute: rule.attribute,
          comparator: rule.comparator === Comparator.EQUALS ? "eq" : "in",
          value: rule.value,
          rollout: rule.rolloutPercentage,
        })),
      },
      user: {
        id: user.id,
        name: user.name || "Unknown",
        email: user.email,
        role: user.role,
      },
      changes: {},
      timestamp: new Date().toISOString(),
    };

    await publishFlagEvent(event);
  }

  return true;
}

export async function listAuditLogs(filterKey?: string): Promise<AuditLog[]> {
  const where = filterKey ? { flagKey: filterKey } : { flagKey: { not: null } }; // Only show logs with valid flag keys

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: true,
      flag: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to last 100 logs
  });

  return logs.map((log) => ({
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    user: {
      email: log.user.email,
      name: log.user.name,
      image: log.user.image,
    },
    flagKey: log.flagKey || "Deleted Flag", // Handle null flagKey
    action: log.action as "Created" | "Updated" | "Deleted",
    enabled: log.flag?.enabled,
  }));
}

export async function evaluateFlag(input: {
  key: string;
  unitId: string;
  attributes: Record<string, unknown>;
}): Promise<{ value: boolean; reason: string }> {
  const flag = await getFlag(input.key);
  if (!flag) return { value: false, reason: "Flag not found" };
  if (!flag.enabled)
    return { value: flag.defaultValue, reason: "Flag disabled" };

  // Try to match rules in order; first match wins
  for (let i = 0; i < flag.rules.length; i++) {
    const r = flag.rules[i];
    const attr = (input.attributes?.[r.attribute] ?? "").toString().trim();
    const parts = r.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let matches = false;
    if (r.comparator === "eq") {
      matches = parts.length > 0 && attr === parts[0];
    } else if (r.comparator === "in") {
      matches = parts.includes(attr);
    }

    if (matches) {
      const pct = percentFromString(input.unitId);
      const hit = pct < r.rollout;
      return { value: hit, reason: `Matched Rule ${i + 1}` };
    }
  }

  return { value: flag.defaultValue, reason: "No rule matched" };
}

function percentFromString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}
