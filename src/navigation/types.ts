import { NavigatorScreenParams } from "@react-navigation/native";

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  SelectRole: undefined;
};

// ─── Role Tab Bars ────────────────────────────────────────────────────────────
export type DeveloperTabParamList = {
  Home: undefined;
  Sprints: undefined;
  Stories: undefined;
  Tests: undefined;
  Profile: undefined;
};

export type ProductOwnerTabParamList = {
  Home: undefined;
  Projects: undefined;
  Backlog: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type QATabParamList = {
  Home: undefined;
  Tests: undefined;
  Reports: undefined;
  Sprints: undefined;
  Profile: undefined;
};

export type ScrumMasterTabParamList = {
  Home: undefined;
  Sprints: undefined;
  Backlog: undefined;
  Team: undefined;
  Profile: undefined;
};

export type SuperAdminTabParamList = {
  Home: undefined;
  Users: undefined;
  Roles: undefined;
  Logs: undefined;
  Profile: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  DeveloperTabs: NavigatorScreenParams<DeveloperTabParamList>;
  ProductOwnerTabs: NavigatorScreenParams<ProductOwnerTabParamList>;
  QATabs: NavigatorScreenParams<QATabParamList>;
  ScrumMasterTabs: NavigatorScreenParams<ScrumMasterTabParamList>;
  SuperAdminTabs: NavigatorScreenParams<SuperAdminTabParamList>;
};
