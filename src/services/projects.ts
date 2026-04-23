import {
  EpicResponse,
  ModuleResponse,
  ProjetResponse,
  ProjetStats,
  UtilisateurResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const projectsService = {
  async getMine(): Promise<ProjetResponse[]> {
    try {
      const res = await apiClient.get<ProjetResponse[]>(
        "/projets/mes-projets"
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getMember(): Promise<ProjetResponse[]> {
    try {
      const res = await apiClient.get<ProjetResponse[]>(
        "/projets/mes-projets-membre"
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(projetId: number): Promise<ProjetResponse> {
    try {
      const res = await apiClient.get<ProjetResponse>(`/projets/${projetId}`);
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getStats(projetId: number): Promise<ProjetStats> {
    try {
      const res = await apiClient.get<ProjetStats>(
        `/projets/${projetId}/statistiques`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getAvailableMembers(): Promise<UtilisateurResponse[]> {
    try {
      const res = await apiClient.get<UtilisateurResponse[]>(
        "/projets/membres-disponibles"
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(data: {
    nom: string;
    description?: string;
    date_debut?: string;
    date_fin?: string;
  }): Promise<ProjetResponse> {
    try {
      const res = await apiClient.post<ProjetResponse>("/projets", data);
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(
    projetId: number,
    data: Partial<{ nom: string; description: string; statut: string }>
  ): Promise<ProjetResponse> {
    try {
      const res = await apiClient.put<ProjetResponse>(
        `/projets/${projetId}`,
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async archive(projetId: number): Promise<ProjetResponse> {
    try {
      const res = await apiClient.patch<ProjetResponse>(
        `/projets/${projetId}/archiver`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async addMembers(
    projetId: number,
    memberIds: number[]
  ): Promise<ProjetResponse> {
    try {
      const res = await apiClient.post<ProjetResponse>(
        `/projets/${projetId}/membres`,
        { membre_ids: memberIds }
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const modulesService = {
  async getAll(projetId: number): Promise<ModuleResponse[]> {
    try {
      const res = await apiClient.get<ModuleResponse[]>(
        `/projets/${projetId}/modules`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const epicsService = {
  async getAll(projetId: number, moduleId: number): Promise<EpicResponse[]> {
    try {
      const res = await apiClient.get<EpicResponse[]>(
        `/projets/${projetId}/modules/${moduleId}/epics`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
