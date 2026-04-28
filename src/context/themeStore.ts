import AsyncStorage from "@react-native-async-storage/async-storage";
import { setGlobalThemeMode } from "@/constants/colors";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "dark",
      isDarkMode: true,
      setMode: (mode) =>
        set(() => {
          setGlobalThemeMode(mode);
          return {
            mode,
            isDarkMode: mode === "dark",
          };
        }),
      toggleMode: () => {
        set((state) => {
          const nextMode: ThemeMode = state.mode === "dark" ? "light" : "dark";
          setGlobalThemeMode(nextMode);
          return {
            mode: nextMode,
            isDarkMode: nextMode === "dark",
          };
        });
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mode: state.mode,
        isDarkMode: state.isDarkMode,
      }),
    },
  ),
);
