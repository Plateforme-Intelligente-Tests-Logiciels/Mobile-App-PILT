import {
  CahierTestResponse,
  CasTestResponse,
  UnitTestResponse,
} from "@/types/api";
import { apiClient, handleApiError } from "./api";

type CahierApiResponse = {
  id: number;
  projet_id: number;
  statut?: string | null;
  date_generation?: string | null;
  nombre_total?: number;
  nombre_reussi?: number;
  nombre_echoue?: number;
  cas_tests?: CasApiResponse[];
};

type CasApiResponse = {
  id: number;
  test_case: string;
  test_purpose?: string | null;
  type_test?: string | null;
  statut_test?: string | null;
  resultat_obtenu?: string | null;
  user_story_id?: number;
};

type BacklogStoryApi = {
  id: number;
};

type UnitTestSummaryApi = {
  id: number;
  nom?: string | null;
  description?: string | null;
  userStoryId?: number | null;
};

type UnitTestsCahierApi = {
  tests?: UnitTestSummaryApi[];
};

type UnitTestDetailApi = {
  id: number;
  nom?: string | null;
  description?: string | null;
  userStoryId?: number | null;
};

const unitTestUserStoryCache = new Map<number, number>();

function normalizeCahierStatus(status?: string | null): CahierTestResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  if (value === "valide") return "VALIDE";
  if (value === "archive") return "ARCHIVE";
  return "BROUILLON";
}

function normalizeCasStatus(status?: string | null): CasTestResponse["statut"] {
  const value = (status ?? "").toLowerCase();
  if (value.includes("reussi") || value.includes("pass")) return "PASSE";
  if (value.includes("echou")) return "ECHEC";
  if (value.includes("bloqu")) return "BLOQUE";
  return "NON_EXECUTE";
}

function denormalizeCasStatus(status: CasTestResponse["statut"]): string {
  if (status === "PASSE") return "Réussi";
  if (status === "ECHEC") return "Échoué";
  if (status === "BLOQUE") return "Bloqué";
  return "Non exécuté";
}

function normalizeCas(item: CasApiResponse): CasTestResponse {
  const typeRaw = (item.type_test ?? "").toLowerCase();
  let type: CasTestResponse["type"] = "MANUEL";
  if (typeRaw.includes("autom")) type = "AUTOMATISE";
  if (typeRaw.includes("unit")) type = "UNITAIRE";

  return {
    id: item.id,
    titre: item.test_case,
    description: item.test_purpose ?? undefined,
    type,
    statut: normalizeCasStatus(item.statut_test),
    resultat: item.resultat_obtenu ?? undefined,
    user_story_id: item.user_story_id,
  };
}

function normalizeCahier(item: CahierApiResponse): CahierTestResponse {
  const cas = (item.cas_tests ?? []).map(normalizeCas);
  return {
    id: item.id,
    titre: `Cahier de tests #${item.id}`,
    statut: normalizeCahierStatus(item.statut),
    projet_id: item.projet_id,
    nb_cas_tests: item.nombre_total ?? cas.length,
    nb_passes: item.nombre_reussi ?? 0,
    nb_echecs: item.nombre_echoue ?? 0,
    created_at: item.date_generation ?? undefined,
    cas_tests: cas,
  };
}

function normalizeUnitTest(item: UnitTestSummaryApi, projetId: number): UnitTestResponse {
  const userStoryId = item.userStoryId ?? undefined;
  if (userStoryId) {
    unitTestUserStoryCache.set(item.id, userStoryId);
  }

  return {
    id: item.id,
    nom: item.nom ?? `Test #${item.id}`,
    description: item.description ?? undefined,
    statut: "EN_ATTENTE",
    user_story_id: userStoryId,
    projet_id: projetId,
  };
}

export const cahierTestsService = {
  async get(projetId: number): Promise<CahierTestResponse | null> {
    try {
      const res = await apiClient.get<CahierApiResponse>(
        `/projets/${projetId}/cahier-tests`
      );
      return normalizeCahier(res.data);
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      handleApiError(e);
    }
  },

  async getDetail(projetId: number): Promise<CahierTestResponse | null> {
    try {
      const res = await apiClient.get<CahierApiResponse>(
        `/projets/${projetId}/cahier-tests/detail`
      );
      return normalizeCahier(res.data);
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
      const res = await apiClient.get<CasApiResponse[]>(
        `/projets/${projetId}/cahier-tests/${cahierId}/cas-tests`
      );
      return res.data.map(normalizeCas);
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
      const payload: { statut_test?: string; resultat_obtenu?: string } = {};
      if (data.statut) payload.statut_test = denormalizeCasStatus(data.statut);
      if (data.resultat) payload.resultat_obtenu = data.resultat;

      const res = await apiClient.patch<CasApiResponse>(
        `/projets/${projetId}/cahier-tests/${cahierId}/cas-tests/${casId}`,
        payload
      );
      return normalizeCas(res.data);
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
      const backlog = await apiClient.get<BacklogStoryApi[]>(`/projets/${projetId}/backlog`);
      const stories = backlog.data ?? [];

      const testsByStory = await Promise.allSettled(
        stories.map((story) =>
          apiClient.get<UnitTestsCahierApi>(
            `/projets/${projetId}/userstories/${story.id}/unit-tests`
          )
        )
      );

      const merged: UnitTestSummaryApi[] = [];
      for (const result of testsByStory) {
        if (result.status === "fulfilled") {
          merged.push(...(result.value.data.tests ?? []));
        }
      }

      return merged.map((item) => normalizeUnitTest(item, projetId));
    } catch (e) {
      handleApiError(e);
    }
  },

  async create(
    projetId: number,
    data: { nom: string; description?: string; user_story_id?: number }
  ): Promise<UnitTestResponse> {
    throw new Error(
      "La creation directe d'un test unitaire n'est pas supportee par cette API. Utilisez la generation IA par user story."
    );
  },

  async execute(projetId: number, testId: number): Promise<UnitTestResponse> {
    try {
      const userStoryId = unitTestUserStoryCache.get(testId);
      if (!userStoryId) {
        throw new Error(
          "Impossible d'executer ce test: user story introuvable. Rechargez la liste des tests."
        );
      }

      await apiClient.post(
        `/projets/${projetId}/userstories/${userStoryId}/unit-tests/${testId}/execute`
      );

      const detail = await apiClient.get<UnitTestDetailApi>(
        `/projets/${projetId}/userstories/${userStoryId}/unit-tests/${testId}`
      );

      return normalizeUnitTest(detail.data, projetId);
    } catch (e) {
      handleApiError(e);
    }
  },

  async delete(projetId: number, testId: number): Promise<void> {
    try {
      const userStoryId = unitTestUserStoryCache.get(testId);
      if (!userStoryId) {
        throw new Error("Suppression non disponible pour ce test.");
      }
      await apiClient.delete(
        `/projets/${projetId}/userstories/${userStoryId}/unit-tests/${testId}`
      );
    } catch (e) {
      handleApiError(e);
    }
  },
};
