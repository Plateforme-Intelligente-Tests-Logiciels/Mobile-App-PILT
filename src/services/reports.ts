import { RapportQAResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

type CahierSummaryApi = {
  id: number;
};

type RapportApiResponse = {
  id: number;
  cahierId: number;
  version: string;
  dateGeneration: string;
  statut?: string | null;
  nombreTestsReussis?: number;
  nombreTestsEchoues?: number;
  nombreTestsBloques?: number;
  qualityIndex?: number;
  recommandations?: string | null;
};

function normalizeReportStatus(status?: string | null): RapportQAResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  return value === "valide" ? "FINALISE" : "BROUILLON";
}

function normalizeReport(item: RapportApiResponse): RapportQAResponse {
  const qualityIndex = item.qualityIndex ?? undefined;
  return {
    id: item.id,
    titre: `Rapport QA v${item.version}`,
    statut: normalizeReportStatus(item.statut),
    projet_id: 0,
    nb_tests_passes: item.nombreTestsReussis ?? 0,
    nb_tests_echoues: item.nombreTestsEchoues ?? 0,
    nb_tests_bloques: item.nombreTestsBloques ?? 0,
    score_qualite: qualityIndex,
    recommandations: item.recommandations ?? undefined,
    created_at: item.dateGeneration,
  };
}

export const reportsService = {
  async getAll(projetId: number): Promise<RapportQAResponse[]> {
    try {
      const cahier = await apiClient.get<CahierSummaryApi>(
        `/projets/${projetId}/cahier-tests`,
      );

      const report = await this.getById(projetId, cahier.data.id);
      return report ? [report] : [];
    } catch (e: any) {
      if (e?.response?.status === 404) return [];
      handleApiError(e);
    }
  },

  async getById(
    projetId: number,
    cahierId: number,
  ): Promise<RapportQAResponse> {
    try {
      const res = await apiClient.get<RapportApiResponse>(
        `/projets/${projetId}/rapports/cahier/${cahierId}`,
      );
      return {
        ...normalizeReport(res.data),
        projet_id: projetId,
      };
    } catch (e) {
      handleApiError(e);
    }
  },

  async generate(
    projetId: number,
    data: { titre: string; cahier_id?: number },
  ): Promise<RapportQAResponse> {
    try {
      let cahierId = data.cahier_id;
      if (!cahierId) {
        const cahier = await apiClient.get<CahierSummaryApi>(
          `/projets/${projetId}/cahier-tests`,
        );
        cahierId = cahier.data.id;
      }

      const res = await apiClient.post<RapportApiResponse>(
        `/projets/${projetId}/rapports/cahier/${cahierId}/generate`,
        {
          mode_generation: "manuelle",
          recommandations: data.titre,
        },
      );
      return {
        ...normalizeReport(res.data),
        projet_id: projetId,
      };
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
      const res = await apiClient.patch<RapportApiResponse>(
        `/projets/${projetId}/rapports/cahier/${rapportId}`,
        {
          recommandations: data.recommandations,
        },
      );
      return {
        ...normalizeReport(res.data),
        projet_id: projetId,
      };
    } catch (e) {
      handleApiError(e);
    }
  },
};
