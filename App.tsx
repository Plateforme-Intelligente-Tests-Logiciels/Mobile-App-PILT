import React, { useEffect, useState } from "react";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { COLORS, setGlobalThemeMode } from "./src/constants/colors";
import { useAuthStore } from "./src/context/authStore";
import { useThemeStore } from "./src/context/themeStore";

SplashScreen.preventAutoHideAsync();

export default function App() {
  // Wait for Zustand persist rehydration
  const [authHydrated, setAuthHydrated] = useState(false);
  const [themeHydrated, setThemeHydrated] = useState(false);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const AppNavigator = authHydrated && themeHydrated
    ? require("./src/navigation/AppNavigator").AppNavigator
    : null;

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });
    // In case hydration already finished before this effect runs
    if (useAuthStore.persist.hasHydrated()) {
      setAuthHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = useThemeStore.persist.onFinishHydration(() => {
      const mode = useThemeStore.getState().mode;
      setGlobalThemeMode(mode);
      setThemeHydrated(true);
    });
    if (useThemeStore.persist.hasHydrated()) {
      const mode = useThemeStore.getState().mode;
      setGlobalThemeMode(mode);
      setThemeHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (authHydrated && themeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [authHydrated, themeHydrated]);

  if (!authHydrated || !themeHydrated || !AppNavigator) {
    return null;
  }

  const navigationTheme = isDarkMode
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.backgroundSecondary,
          text: COLORS.text,
          border: COLORS.inputBorder,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.backgroundSecondary,
          text: COLORS.text,
          border: COLORS.inputBorder,
        },
      };

  const linking: LinkingOptions<any> = {
    prefixes: ["mobileapp://"],
    config: {
      screens: {
        ResetPassword: "auth/reset-password",
      },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme} linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
