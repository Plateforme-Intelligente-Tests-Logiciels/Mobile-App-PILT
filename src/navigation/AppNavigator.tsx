import React from "react";
import { useAuthStore } from "@/context/authStore";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};
