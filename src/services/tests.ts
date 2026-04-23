import {
  CahierTestResponse,
  CasTestResponse,
  UnitTestResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

export const cahierTestsService = {
  async get(projetId: number): Promise<CahierTestResponse | null> {
    try {
      const res = await apiClient.get<CahierTestResponse>(
        `/projets/${projetId}/cahier-tests`
      );
      return res.data;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      handleApiError(e);
    }
  },

  async getDetail(projetId: number): Promise<CahierTestResponse | null> {
    try {
      const res = await apiClient.get<CahierTestResponse>(
        `/projets/${projetId}/cahier-tests/detail`
      );
      return res.data;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      handleApiError(e);
    }
  },

  async getCasTests(
    projetId: number,
    cahierId: number
  ): Promise<CasTestResponse[]> {
    try {
      const res = await apiClient.get<CasTestResponse[]>(
        `/projets/${projetId}/cahier-tests/${cahierId}/cas-tests`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async updateCasTest(
    projetId: number,
    cahierId: number,
    casId: number,
    data: Partial<{ statut: CasTestResponse["statut"]; resultat: string }>
  ): Promise<CasTestResponse> {
    try {
      const res = await apiClient.patch<CasTestResponse>(
        `/projets/${projetId}/cahier-tests/${cahierId}/cas-tests/${casId}`,
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async generate(projetId: number): Promise<{ job_id: string }> {
    try {
      const res = await apiClient.post<{ job_id: string }>(
        `/projets/${projetId}/cahier-tests/generate`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async validate(
    projetId: number,
    cahierId: number
  ): Promise<CahierTestResponse> {
    try {
      const res = await apiClient.patch<CahierTestResponse>(
        `/projets/${projetId}/cahier-tests/${cahierId}/valider`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },
};

export const unitTestsService = {
  async getAll(projetId: number): Promise<UnitTestResponse[]> {
    try {
      const res = await apiClient.get<UnitTestResponse[]>(
        `/projets/${projetId}/unit-tests`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(
    projetId: number,
    data: { nom: string; description?: string; user_story_id?: number }
  ): Promise<UnitTestResponse> {
    try {
      const res = await apiClient.post<UnitTestResponse>(
        `/projets/${projetId}/unit-tests`,
        data
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async execute(projetId: number, testId: number): Promise<UnitTestResponse> {
    try {
      const res = await apiClient.post<UnitTestResponse>(
        `/projets/${projetId}/unit-tests/${testId}/execute`
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async delete(projetId: number, testId: number): Promise<void> {
    try {
      await apiClient.delete(`/projets/${projetId}/unit-tests/${testId}`);
    } catch (e) {
      handleApiError(e);
    }
  },
};
