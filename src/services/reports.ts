import { RapportQAResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const reportsService = {
  async getAll(projetId: number): Promise<RapportQAResponse[]> {
    try {
      const res = await apiClient.get<RapportQAResponse[]>(
        `/projets/${projetId}/rapports`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    rapportId: number,
  ): Promise<RapportQAResponse> {
    try {
      const res = await apiClient.get<RapportQAResponse>(
        `/projets/${projetId}/rapports/${rapportId}`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async generate(
    projetId: number,
    data: { titre: string; cahier_id?: number },
  ): Promise<RapportQAResponse> {
    try {
      const res = await apiClient.post<RapportQAResponse>(
        `/projets/${projetId}/rapports`,
        data,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async update(
    projetId: number,
    rapportId: number,
    data: Partial<{ titre: string; recommandations: string; statut: string }>,
  ): Promise<RapportQAResponse> {
    try {
      const res = await apiClient.patch<RapportQAResponse>(
        `/projets/${projetId}/rapports/${rapportId}`,
        data,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};
