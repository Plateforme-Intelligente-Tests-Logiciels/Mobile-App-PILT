import {
  AuditLogResponse,
  DashboardActivity,
  LogStats,
  SystemLogResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const logsService = {
  async getAudit(params?: {
    skip?: number;
    limit?: number;
  }): Promise<AuditLogResponse[]> {
    try {
      const res = await apiClient.get<AuditLogResponse[]>("/logs/audit", {
        params,
      });
      return res.data;
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
      const res = await apiClient.get<SystemLogResponse[]>("/logs/system", {
        params,
      });
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getStats(): Promise<LogStats> {
    try {
      const res = await apiClient.get<LogStats>("/logs/stats");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getDashboardActivity(days?: number): Promise<DashboardActivity> {
    try {
      const res = await apiClient.get<DashboardActivity>("/dashboard/activity", {
        params: { days: days ?? 7 },
      });
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
