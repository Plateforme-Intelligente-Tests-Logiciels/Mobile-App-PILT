import { useAuthStore } from "@/context/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import { Alert } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

let sessionExpiredAlertShown = false;
let lastSeenToken: string | null = null;

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use(async (config) => {
    try {
      const stored = await AsyncStorage.getItem("auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;

        if (token !== lastSeenToken) {
          lastSeenToken = token ?? null;
          sessionExpiredAlertShown = false;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        lastSeenToken = null;
      }
    } catch {}
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const detail = error.response?.data?.detail;
          const isInvalidToken =
            typeof detail === "string" &&
            detail.toLowerCase().includes("token");

          if (isInvalidToken || !error.config?.url?.includes("/auth/login")) {
            if (!sessionExpiredAlertShown) {
              sessionExpiredAlertShown = true;
              Alert.alert(
                "Compte en attente",
                "Votre compte sera active apres l'activation du Super Admin.",
              );
            }

            await AsyncStorage.removeItem("auth-storage");
            useAuthStore.getState().logout();
          }
        } catch {
          // Ignore cleanup failures and forward original API error.
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

export const apiClient = createApiClient();

export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const isTimeout =
      error.code === "ECONNABORTED" ||
      (typeof error.message === "string" && error.message.includes("timeout"));

    if (isTimeout) {
      throw new Error(
        "Le serveur met trop de temps a repondre. Verifiez EXPO_PUBLIC_API_URL et votre connexion.",
      );
    }

    if (!error.response) {
      throw new Error(
        "Impossible de joindre l'API. Verifiez EXPO_PUBLIC_API_URL et que le backend est demarre.",
      );
    }

    const detail = error.response?.data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error instanceof Error ? error : new Error("Une erreur est survenue");
}
