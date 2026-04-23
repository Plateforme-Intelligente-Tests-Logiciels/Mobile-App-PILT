import { BacklogIndicateurs, UserStoryResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const storiesService = {
  async getBacklog(projetId: number): Promise<UserStoryResponse[]> {
    try {
      const res = await apiClient.get<UserStoryResponse[]>(
        `/projets/${projetId}/backlog`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getBacklogIndicateurs(projetId: number): Promise<BacklogIndicateurs> {
    try {
      const res = await apiClient.get<BacklogIndicateurs>(
        `/projets/${projetId}/backlog/indicateurs`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getForEpic(
    projetId: number,
    moduleId: number,
    epicId: number,
  ): Promise<UserStoryResponse[]> {
    try {
      const res = await apiClient.get<UserStoryResponse[]>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    moduleId: number,
    epicId: number,
    storyId: number,
  ): Promise<UserStoryResponse> {
    try {
      const res = await apiClient.get<UserStoryResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async updateStatus(
    projetId: number,
    moduleId: number | undefined,
    epicId: number,
    storyId: number,
    statut: UserStoryResponse["statut"],
  ): Promise<UserStoryResponse> {
    try {
      if (typeof moduleId !== "number") {
        throw new Error(
          "module_id manquant pour mettre à jour le statut de la story.",
        );
      }

      const res = await apiClient.patch<UserStoryResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}/statut`,
        { statut },
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async assign(
    projetId: number,
    moduleId: number,
    epicId: number,
    storyId: number,
    assigneeId: number,
  ): Promise<UserStoryResponse> {
    try {
      const res = await apiClient.patch<UserStoryResponse>(
        `/projets/${projetId}/modules/${moduleId}/epics/${epicId}/userstories/${storyId}/assigner`,
        { assignee_id: assigneeId },
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
