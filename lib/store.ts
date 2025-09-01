import type { FeatureFlag, AuditLog, FlagRule } from "./types";

let flags: FeatureFlag[] = [
  {
    key: "new-dashboard",
    defaultValue: false,
    enabled: true,
    rules: [
      {
        id: "r1",
        attribute: "plan",
        comparator: "in",
        value: "pro,enterprise",
        rollout: 100,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
];

const auditLogs: AuditLog[] = [
  {
    id: "log1",
    timestamp: new Date().toISOString(),
    user: "demo@flipswitch.app",
    flagKey: "new-dashboard",
    action: "Created",
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribeFlagsChanged(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function notifyFlagsChanged() {
  for (const l of listeners) l();
}

export async function listFlags(): Promise<FeatureFlag[]> {
  return structuredClone(flags);
}

export async function getFlag(key: string): Promise<FeatureFlag | null> {
  const f = flags.find((x) => x.key === key);
  return f ? structuredClone(f) : null;
}

export async function createFlag(data: Omit<FeatureFlag, "updatedAt">) {
  const exists = flags.some((f) => f.key === data.key);
  if (exists) {
    throw new Error("Flag key already exists");
  }
  const next: FeatureFlag = { ...data, updatedAt: new Date().toISOString() };
  flags.push(next);
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "demo@flipswitch.app",
    flagKey: data.key,
    action: "Created",
  });
  notifyFlagsChanged();
  return structuredClone(next);
}

export async function updateFlag(
  key: string,
  patch: Partial<Omit<FeatureFlag, "key" | "updatedAt">>
) {
  const idx = flags.findIndex((f) => f.key === key);
  if (idx === -1) throw new Error("Flag not found");
  const current = flags[idx];
  const next: FeatureFlag = {
    ...current,
    ...patch,
    ...(patch.rules ? { rules: patch.rules as FlagRule[] } : {}),
    updatedAt: new Date().toISOString(),
  };
  flags[idx] = next;
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "demo@flipswitch.app",
    flagKey: key,
    action: "Updated",
  });
  notifyFlagsChanged();
  return structuredClone(next);
}

export async function deleteFlag(key: string) {
  const before = flags.length;
  flags = flags.filter((f) => f.key !== key);
  if (flags.length === before) throw new Error("Flag not found");
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "demo@flipswitch.app",
    flagKey: key,
    action: "Deleted",
  });
  notifyFlagsChanged();
  return true;
}

export async function listAuditLogs(opts?: {
  flagKey?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 10;
  const filtered = opts?.flagKey
    ? auditLogs.filter((a) => a.flagKey === opts!.flagKey)
    : auditLogs;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    total: filtered.length,
    items: structuredClone(filtered.slice(start, end)),
  };
}
