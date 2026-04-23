export type UserRole =
  | "Super Admin"
  | "Développeur"
  | "Testeur QA"
  | "Product Owner"
  | "Scrum Master";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ===== PILT API Types =====

export interface PILTTokenRole {
  id: number;
  nom: string;
  code: string;
  niveau_acces: number;
}

export interface PILTAuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  nom: string;
  email: string;
  role?: PILTTokenRole;
}

export interface PILTRegisterRequest {
  nom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  role_id: number;
}

export interface PILTSelectRoleRequest {
  user_id: number;
  role: number; // role_id
}

export interface MessageResponse {
  message: string;
}
