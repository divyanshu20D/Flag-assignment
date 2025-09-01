export type Comparator = "eq" | "in";

export type Rule = {
  id: string;
  attribute: string; // e.g., country, device, plan
  comparator: Comparator; // "eq" or "in"
  value: string; // single value or comma-separated list
  rollout: number; // 0-100
};

export type Flag = {
  key: string;
  defaultValue: boolean;
  enabled: boolean;
  updatedAt: string; // ISO timestamp
  rules: Rule[];
};

export type AuditLog = {
  id: string;
  timestamp: string;
  user: {
    email: string;
    name: string | null;
    image: string | null;
  };
  flagKey: string | null; // Can be null for deleted flags
  action: "Created" | "Updated" | "Deleted";
  enabled?: boolean;
};
