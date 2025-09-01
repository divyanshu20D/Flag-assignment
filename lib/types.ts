export type Comparator = "eq" | "in";

export type Rule = {
  id: string;
  attribute: string;
  comparator: Comparator;
  value: string;
  rollout: number;
};

export type Flag = {
  key: string;
  defaultValue: boolean;
  enabled: boolean;
  updatedAt: string;
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
  flagKey: string | null;
  action: "Created" | "Updated" | "Deleted";
  enabled?: boolean;
};
