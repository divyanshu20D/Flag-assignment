import type { EvaluateInput, EvaluateResult, FeatureFlag } from "./types"
import { getFlag } from "./store"

// simple deterministic hash 0..99
function bucket(unitId: string, key: string) {
  let h = 2166136261
  const s = `${unitId}:${key}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24) // FNV-like
  }
  // ensure non-negative 32-bit
  const n = (h >>> 0) % 100
  return n
}

function matchesRule(rule: FeatureFlag["rules"][number], attrs: Record<string, unknown>) {
  const left = String(attrs[rule.attribute] ?? "")
  if (rule.comparator === "=") {
    return left === rule.value
  }
  if (rule.comparator === "in") {
    const set = rule.value
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
    return set.includes(left)
  }
  return false
}

export async function evaluateFlag(input: EvaluateInput): Promise<EvaluateResult> {
  const flag = await getFlag(input.key)
  if (!flag) {
    return { value: false, reason: "Flag not found" }
  }
  if (!flag.enabled) {
    return { value: flag.defaultValue, reason: "Flag disabled (default)" }
  }

  const attrs = input.attributes ?? {}
  for (let i = 0; i < flag.rules.length; i++) {
    const r = flag.rules[i]
    if (matchesRule(r, attrs)) {
      const b = bucket(input.unitId, flag.key)
      if (b < Math.max(0, Math.min(100, r.rollout))) {
        return { value: true, reason: `Matched Rule ${i + 1}` }
      }
    }
  }
  return { value: flag.defaultValue, reason: "Default" }
}
