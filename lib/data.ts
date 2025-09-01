import { prisma } from './prisma'
import { redis, CACHE_KEYS, publishFlagEvent, type FlagEvent } from './redis'
import { Comparator } from '@prisma/client'
import type { Flag, AuditLog } from "./types"

export async function listFlags(workspaceId: string): Promise<Flag[]> {
  // Try cache first
  const cached = await redis.get(CACHE_KEYS.FLAGS(workspaceId))
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const dbFlags = await prisma.flag.findMany({
    where: { workspaceId },
    include: { rules: true },
    orderBy: { key: 'asc' },
  })

  // Transform to match our Flag type
  const flags: Flag[] = dbFlags.map(flag => ({
    key: flag.key,
    defaultValue: flag.defaultValue,
    enabled: flag.enabled,
    updatedAt: flag.updatedAt.toISOString(),
    rules: flag.rules.map(rule => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? 'eq' : 'in',
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  }))

  // Cache for 5 minutes
  await redis.setex(CACHE_KEYS.FLAGS(workspaceId), 300, JSON.stringify(flags))

  return flags
}

export async function getFlag(key: string, workspaceId: string): Promise<Flag | undefined> {
  // Try cache first
  const cached = await redis.get(CACHE_KEYS.FLAG(workspaceId, key))
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const dbFlag = await prisma.flag.findUnique({
    where: {
      key_workspaceId: { key, workspaceId }
    },
    include: { rules: true },
  })

  if (!dbFlag) return undefined

  // Transform to match our Flag type
  const flag: Flag = {
    key: dbFlag.key,
    defaultValue: dbFlag.defaultValue,
    enabled: dbFlag.enabled,
    updatedAt: dbFlag.updatedAt.toISOString(),
    rules: dbFlag.rules.map(rule => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? 'eq' : 'in',
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  }

  // Cache for 5 minutes
  await redis.setex(CACHE_KEYS.FLAG(workspaceId, key), 300, JSON.stringify(flag))

  return flag
}

export async function upsertFlag(next: Flag, workspaceId: string, userId: string): Promise<Flag> {
  const existing = await prisma.flag.findUnique({
    where: { key_workspaceId: { key: next.key, workspaceId } },
    include: { rules: true }
  })

  const isUpdate = !!existing

  // Track changes for real-time events
  const changes: FlagEvent['changes'] = {}
  if (existing) {
    if (existing.enabled !== next.enabled) {
      changes.enabled = { from: existing.enabled, to: next.enabled }
    }
    if (existing.defaultValue !== next.defaultValue) {
      changes.defaultValue = { from: existing.defaultValue, to: next.defaultValue }
    }
    // Compare rules (simplified comparison)
    const existingRules = existing.rules.map(r => ({
      attribute: r.attribute,
      comparator: r.comparator === Comparator.EQUALS ? 'eq' : 'in',
      value: r.value,
      rollout: r.rolloutPercentage
    }))
    if (JSON.stringify(existingRules) !== JSON.stringify(next.rules)) {
      changes.rules = { from: existingRules, to: next.rules }
    }
  }

  // Upsert flag with rules
  const dbFlag = await prisma.flag.upsert({
    where: { key_workspaceId: { key: next.key, workspaceId } },
    update: {
      defaultValue: next.defaultValue,
      enabled: next.enabled,
      rules: {
        deleteMany: {},
        create: next.rules.map(rule => ({
          attribute: rule.attribute,
          comparator: rule.comparator === 'eq' ? Comparator.EQUALS : Comparator.IN,
          value: rule.value,
          rolloutPercentage: rule.rollout,
        })),
      },
    },
    create: {
      key: next.key,
      defaultValue: next.defaultValue,
      enabled: next.enabled,
      workspaceId,
      rules: {
        create: next.rules.map(rule => ({
          attribute: rule.attribute,
          comparator: rule.comparator === 'eq' ? Comparator.EQUALS : Comparator.IN,
          value: rule.value,
          rolloutPercentage: rule.rollout,
        })),
      },
    },
    include: { rules: true },
  })

  // Get user details for event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  })

  // Create single audit log entry
  await prisma.auditLog.create({
    data: {
      action: isUpdate ? 'Updated' : 'Created',
      flagKey: next.key,
      userId,
      workspaceId,
    },
  })

  // Clear cache
  await redis.del(CACHE_KEYS.FLAG(workspaceId, next.key))
  await redis.del(CACHE_KEYS.FLAGS(workspaceId))

  // Transform to match our Flag type
  const flag: Flag = {
    key: dbFlag.key,
    defaultValue: dbFlag.defaultValue,
    enabled: dbFlag.enabled,
    updatedAt: dbFlag.updatedAt.toISOString(),
    rules: dbFlag.rules.map(rule => ({
      id: rule.id,
      attribute: rule.attribute,
      comparator: rule.comparator === Comparator.EQUALS ? 'eq' : 'in',
      value: rule.value,
      rollout: rule.rolloutPercentage,
    })),
  }

  // Publish real-time event
  if (user) {
    await publishFlagEvent({
      type: isUpdate ? 'flag_updated' : 'flag_created',
      workspaceId,
      flag,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString(),
      changes: isUpdate && Object.keys(changes).length > 0 ? changes : undefined
    })
  }

  return flag
}

export async function deleteFlag(key: string, workspaceId: string, userId: string): Promise<boolean> {
  const existing = await prisma.flag.findUnique({
    where: { key_workspaceId: { key, workspaceId } },
    include: { rules: true }
  })

  if (!existing) return false

  // Get user details for event
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  })

  await prisma.flag.delete({
    where: { key_workspaceId: { key, workspaceId } },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'Deleted',
      flagKey: key,
      userId,
      workspaceId,
    },
  })

  // Clear cache
  await redis.del(CACHE_KEYS.FLAG(workspaceId, key))
  await redis.del(CACHE_KEYS.FLAGS(workspaceId))

  // Publish real-time event
  if (user) {
    const deletedFlag: Flag = {
      key: existing.key,
      defaultValue: existing.defaultValue,
      enabled: existing.enabled,
      updatedAt: existing.updatedAt.toISOString(),
      rules: existing.rules.map(rule => ({
        id: rule.id,
        attribute: rule.attribute,
        comparator: rule.comparator === Comparator.EQUALS ? 'eq' : 'in',
        value: rule.value,
        rollout: rule.rolloutPercentage,
      })),
    }

    await publishFlagEvent({
      type: 'flag_deleted',
      workspaceId,
      flag: deletedFlag,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      timestamp: new Date().toISOString()
    })
  }

  return true
}

export async function listAuditLogs(workspaceId: string, filterKey?: string): Promise<AuditLog[]> {
  const dbLogs = await prisma.auditLog.findMany({
    where: {
      workspaceId,
      ...(filterKey && { flagKey: filterKey }),
    },
    include: {
      user: true,
      flag: true
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return dbLogs.map(log => ({
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    user: {
      email: log.user.email,
      name: log.user.name,
      image: log.user.image,
    },
    flagKey: log.flagKey,
    action: log.action as "Created" | "Updated" | "Deleted",
    enabled: log.flag?.enabled,
  }))
}

export async function evaluateFlag(input: {
  key: string
  unitId: string
  attributes: Record<string, unknown>
  workspaceId: string
}): Promise<{ value: boolean; reason: string }> {
  const flag = await getFlag(input.key, input.workspaceId)
  if (!flag) return { value: false, reason: "Flag not found" }
  if (!flag.enabled) return { value: flag.defaultValue, reason: "Flag disabled" }

  // Try to match rules in order; first match wins
  for (let i = 0; i < flag.rules.length; i++) {
    const r = flag.rules[i]
    const attr = (input.attributes?.[r.attribute] ?? "").toString().trim()
    const parts = r.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    let matches = false
    if (r.comparator === "eq") {
      matches = parts.length > 0 && attr === parts[0]
    } else if (r.comparator === "in") {
      matches = parts.includes(attr)
    }

    if (matches) {
      const pct = percentFromString(input.unitId)
      const hit = pct < r.rollout
      return { value: hit, reason: `Matched Rule ${i + 1}` }
    }
  }

  return { value: flag.defaultValue, reason: "No rule matched" }
}

function percentFromString(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return hash % 100
}

// Helper function to get default workspace ID for backward compatibility
export async function getDefaultWorkspaceId(): Promise<string> {
  const workspace = await prisma.workspace.findFirst()
  if (!workspace) {
    throw new Error('No workspace found. Please run the seed script.')
  }
  return workspace.id
}

// Helper function to get default admin user ID
export async function getDefaultAdminUserId(workspaceId: string): Promise<string> {
  const adminUser = await prisma.user.findFirst({
    where: {
      workspaceId,
      role: 'ADMIN'
    }
  })
  if (!adminUser) {
    throw new Error('No admin user found. Please run the seed script.')
  }
  return adminUser.id
}
