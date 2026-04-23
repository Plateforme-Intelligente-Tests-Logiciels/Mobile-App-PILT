import {
    AuthResponse,
    ForgotPasswordRequest,
    LoginCredentials,
    PILTAuthResponse,
    PILTRegisterRequest,
    RegisterCredentials,
    ResetPasswordRequest,
} from "@/types/auth";
import axios, { AxiosInstance } from "axios";

// Configure with PILT backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Type for PILT API responses
interface PILTTokenRole {
  id: number;
  nom: string;
  code: string;
  niveau_acces: number;
}

class AuthApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
  }

  /**
   * Transform PILT API response to app format
   */
  private transformPILTResponse(piltResponse: PILTAuthResponse): AuthResponse {
    return {
      user: {
        id: piltResponse.user_id.toString(),
        email: piltResponse.email,
        fullName: piltResponse.nom,
        phoneNumber: "", // Backend doesn't return phone in auth response
        role: this.getRoleFromCode(piltResponse.role?.code),
        createdAt: new Date().toISOString(),
      },
      token: piltResponse.access_token,
      refreshToken: "", // PILT doesn't use refresh tokens in auth response
    };
  }

  /**
   * Convert PILT role code to app role name
   */
  private getRoleFromCode(
    code?: string,
  ): "Développeur" | "Testeur QA" | "Product Owner" | "Scrum Master" {
    switch (code?.toUpperCase()) {
      case "DEVELOPPEUR":
        return "Développeur";
      case "TESTEUR_QA":
        return "Testeur QA";
      case "PRODUCT_OWNER":
        return "Product Owner";
      case "SCRUM_MASTER":
        return "Scrum Master";
      default:
        return "Développeur"; // Default role
    }
  }

  /**
   * Convert app role name to PILT role ID
   */
  private getRoleId(role: string): number {
    switch (role) {
      case "Développeur":
        return 2;
      case "Testeur QA":
        return 3;
      case "Product Owner":
        return 4;
      case "Scrum Master":
        return 5;
      default:
        return 2; // Default to DEVELOPPEUR
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // PILT uses OAuth2PasswordRequestForm (username/password)
      const formData = new URLSearchParams();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const response = await this.axiosInstance.post<PILTAuthResponse>(
        "/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const authResponse = this.transformPILTResponse(response.data);
      this.setAuthToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Transform app format to PILT format
      const piltRequest: PILTRegisterRequest = {
        nom: credentials.fullName,
        email: credentials.email,
        motDePasse: credentials.password,
        telephone: credentials.phoneNumber || undefined,
        role_id: this.getRoleId(credentials.role),
      };

      const response = await this.axiosInstance.post<PILTAuthResponse>(
        "/auth/register",
        piltRequest,
      );

      const authResponse = this.transformPILTResponse(response.data);
      this.setAuthToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post<{ message: string }>(
        "/auth/request-reset-password",
        { email: request.email },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(
    request: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    try {
      const response = await this.axiosInstance.post<{ message: string }>(
        "/auth/reset-password",
        {
          token: request.token,
          new_password: request.newPassword,
        },
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async selectRole(userId: number, role: string): Promise<AuthResponse> {
    try {
      const response = await this.axiosInstance.post<PILTAuthResponse>(
        "/auth/select-role",
        {
          user_id: userId,
          role: this.getRoleId(role),
        },
      );

      const authResponse = this.transformPILTResponse(response.data);
      this.setAuthToken(authResponse.token);
      return authResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      // PILT OAuth callback would handle this
      // For now, redirect to PILT OAuth login flow
      throw new Error(
        "Google login via PILT is handled through OAuth callback",
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async loginWithGitHub(githubToken: string): Promise<AuthResponse> {
    try {
      // PILT OAuth callback would handle this
      // For now, redirect to PILT OAuth login flow
      throw new Error(
        "GitHub login via PILT is handled through OAuth callback",
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getOAuthLoginUrl(
    provider: "google" | "github",
    intent: "login" | "register" = "login",
  ): string {
    const intentParam = intent === "register" ? "?intent=register" : "";
    return `${API_BASE_URL}/auth/oauth/${provider}/login${intentParam}`;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error instanceof Error
      ? error
      : new Error("Une erreur est survenue");
  }
}

export const authApi = new AuthApi();
