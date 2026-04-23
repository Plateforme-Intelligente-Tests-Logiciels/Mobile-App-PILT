import {
  RoleResponse,
  UtilisateurResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const usersService = {
  async getAll(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurResponse[]>("/users");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getPending(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurResponse[]>("/users/pending");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async activate(userId: number): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.patch<UtilisateurResponse>(
        `/users/${userId}/activate`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async deactivate(userId: number): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.patch<UtilisateurResponse>(
        `/users/${userId}/deactivate`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async delete(userId: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${userId}`);
    } catch (e) {
      handleApiError(e);
    }
  },

  async getMe(): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.get<UtilisateurResponse>("/auth/me");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async updateProfile(data: {
    nom?: string;
    telephone?: string;
  }): Promise<UtilisateurResponse> {
    try {
      const res = await apiClient.patch<UtilisateurResponse>(
        "/users/me/profile",
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const rolesService = {
  async getAll(): Promise<RoleResponse[]> {
    try {
      const res = await apiClient.get<RoleResponse[]>("/roles");
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async assignToUser(userId: number, roleId: number): Promise<void> {
    try {
      await apiClient.post("/roles/assign-user", {
        user_id: userId,
        role_id: roleId,
      });
    } catch (e) {
      handleApiError(e);
    }
  },
};
