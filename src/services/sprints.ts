import { SprintResponse, SprintVelocite, UserStoryResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const sprintsService = {
  async getAll(projetId: number): Promise<SprintResponse[]> {
    try {
      const res = await apiClient.get<SprintResponse[]>(
        `/projets/${projetId}/sprints`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getActive(projetId: number): Promise<SprintResponse | null> {
    try {
      const res = await apiClient.get<SprintResponse>(
        `/projets/${projetId}/sprints/actif`
      );
      return res.data;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    sprintId: number
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.get<SprintResponse>(
        `/projets/${projetId}/sprints/${sprintId}`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getVelocite(
    projetId: number,
    sprintId: number
  ): Promise<SprintVelocite> {
    try {
      const res = await apiClient.get<SprintVelocite>(
        `/projets/${projetId}/sprints/${sprintId}/velocite`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(
    projetId: number,
    data: {
      nom: string;
      objectif?: string;
      date_debut: string;
      date_fin: string;
    }
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.post<SprintResponse>(
        `/projets/${projetId}/sprints`,
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(
    projetId: number,
    sprintId: number,
    data: Partial<{ nom: string; objectif: string; date_debut: string; date_fin: string }>
  ): Promise<SprintResponse> {
    try {
      const res = await apiClient.put<SprintResponse>(
        `/projets/${projetId}/sprints/${sprintId}`,
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async start(projetId: number, sprintId: number): Promise<SprintResponse> {
    try {
      const res = await apiClient.patch<SprintResponse>(
        `/projets/${projetId}/sprints/${sprintId}/demarrer`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async close(projetId: number, sprintId: number): Promise<SprintResponse> {
    try {
      const res = await apiClient.patch<SprintResponse>(
        `/projets/${projetId}/sprints/${sprintId}/cloturer`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async addUserStories(
    projetId: number,
    sprintId: number,
    storyIds: number[]
  ): Promise<void> {
    try {
      await apiClient.post(
        `/projets/${projetId}/sprints/${sprintId}/userstories`,
        { user_story_ids: storyIds }
      );
    } catch (e) {
      handleApiError(e);
    }
  },
};
