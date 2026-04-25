import {
  AuditLogResponse,
  DashboardActivity,
  LogStats,
  SystemLogResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

type AuditApiItem = {
  id: number;
  action: string;
  timestamp: string;
  entity_type?: string;
  entity_id?: string | number;
  user?: {
    nom?: string;
    email?: string;
  } | null;
};

type AuditApiResponse = {
  logs?: AuditApiItem[];
};

type SystemApiItem = {
  id: number;
  niveau: string;
  message: string;
  source: string;
  date_time: string;
};

type SystemApiResponse = {
  logs?: SystemApiItem[];
};

type LogStatsApiResponse = {
  totals?: {
    audit_last_24h?: number;
    system_errors_24h?: number;
    system_total?: number;
  };
  system_logs_by_niveau?: Array<{ niveau?: string; count?: number }>;
};

type DashboardActivityPoint = {
  date: string;
  logins?: number;
  testExecutions?: number;
};

function normalizeAudit(item: AuditApiItem): AuditLogResponse {
  return {
    id: item.id,
    action: item.action,
    resource: item.entity_type ?? "resource",
    resource_id: item.entity_id !== undefined ? String(item.entity_id) : undefined,
    user_nom: item.user?.nom ?? "Inconnu",
    user_email: item.user?.email ?? "inconnu@local",
    timestamp: item.timestamp,
  };
}

function normalizeSystem(item: SystemApiItem): SystemLogResponse {
  const level = (item.niveau ?? "INFO").toUpperCase() as SystemLogResponse["level"];
  return {
    id: item.id,
    level,
    message: item.message,
    source: item.source,
    timestamp: item.date_time,
  };
}

function computeHealth(total: number, errors: number): number {
  if (total <= 0) return 100;
  const ratio = Math.max(0, Math.min(1, 1 - errors / total));
  return Math.round(ratio * 100);
}

export const logsService = {
  async getAudit(params?: {
    skip?: number;
    limit?: number;
  }): Promise<AuditLogResponse[]> {
    try {
      const res = await apiClient.get<AuditApiResponse | AuditApiItem[]>("/logs/audit", {
        params,
      });
      const logs = Array.isArray(res.data) ? res.data : res.data.logs ?? [];
      return logs.map(normalizeAudit);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getSystem(params?: {
    skip?: number;
    limit?: number;
    level?: string;
  }): Promise<SystemLogResponse[]> {
    try {
      const res = await apiClient.get<SystemApiResponse | SystemApiItem[]>("/logs/system", {
        params,
      });
      const logs = Array.isArray(res.data) ? res.data : res.data.logs ?? [];
      return logs.map(normalizeSystem);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getStats(): Promise<LogStats> {
    try {
      const res = await apiClient.get<LogStatsApiResponse>("/logs/stats");
      const totals = res.data.totals ?? {};
      const warningsToday = (res.data.system_logs_by_niveau ?? [])
        .filter((entry) => (entry.niveau ?? "").toUpperCase() === "WARNING")
        .reduce((acc, entry) => acc + (entry.count ?? 0), 0);

      const totalToday = totals.audit_last_24h ?? 0;
      const errorsToday = totals.system_errors_24h ?? 0;
      const systemTotal = totals.system_total ?? 0;

      return {
        total_today: totalToday,
        errors_today: errorsToday,
        warnings_today: warningsToday,
        system_health: computeHealth(systemTotal, errorsToday),
      };
    } catch (e) {
      handleApiError(e);
    }
  },

  async getDashboardActivity(days?: number): Promise<DashboardActivity> {
    try {
      const res = await apiClient.get<DashboardActivityPoint[]>("/dashboard/activity", {
        params: { days: days ?? 7 },
      });
      const points = Array.isArray(res.data) ? res.data : [];
      return {
        labels: points.map((point) => point.date),
        connexions: points.map((point) => point.logins ?? 0),
        tests: points.map((point) => point.testExecutions ?? 0),
      };
    } catch (e) {
      handleApiError(e);
    }
  },
};
