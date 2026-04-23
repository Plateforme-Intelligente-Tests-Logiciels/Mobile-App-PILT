import { AuthState, User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authApi } from "./api";

interface AuthStore extends AuthState {
  // Auth actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    role: any,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  loginWithGitHub: (githubToken: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // Getters
  getUser: () => User | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Simple setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Async login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur de connexion";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Async register
      register: async (fullName, email, phoneNumber, role, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({
            fullName,
            email,
            phoneNumber,
            role,
            password,
          });
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur d'inscription";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Logout
      logout: () => {
        authApi.clearAuthToken();
        set(initialState);
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword({ email });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la demande";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword({ token, newPassword });
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la réinitialisation";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Social login - Google
      loginWithGoogle: async (googleToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithGoogle(googleToken);
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur Google";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Social login - GitHub
      loginWithGitHub: async (githubToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithGitHub(githubToken);
          authApi.setAuthToken(response.token);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur GitHub";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.refreshToken(refreshToken);
          authApi.setAuthToken(response.token);
          set({
            token: response.token,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          set({ isAuthenticated: false });
          authApi.clearAuthToken();
          throw error;
        }
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      isAuthenticated: () => get().isAuthenticated,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
