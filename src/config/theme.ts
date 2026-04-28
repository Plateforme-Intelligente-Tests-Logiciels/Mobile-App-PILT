// Theme utilities and helpers

import { COLORS, SIZES } from "@/constants";

export const getButtonStyles = (variant: string) => {
  const styles: Record<string, any> = {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.text,
    },
    secondary: {
      backgroundColor: COLORS.backgroundSecondary,
      color: COLORS.text,
    },
    outline: {
      backgroundColor: "transparent",
      color: COLORS.primary,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    danger: {
      backgroundColor: COLORS.error,
      color: COLORS.text,
    },
  };

  return styles[variant] || styles.primary;
};

export const getShadow = (elevation: number = 4) => {
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.1 + elevation * 0.025,
    shadowRadius: elevation * 3,
    elevation,
  };
};

export const getSpacing = (level: 1 | 2 | 3 | 4 | 5): number => {
  const spacing: Record<number, number> = {
    1: SIZES.sm,
    2: SIZES.md,
    3: SIZES.lg,
    4: SIZES.xl,
    5: SIZES.xxl,
  };
  return spacing[level];
};

export const getResponsiveFontSize = (
  baseSize: number,
  multiplier: number = 1,
) => {
  return baseSize * multiplier;
};

export const createGradientStyle = (colors: string[]) => {
  // Note: For actual gradient rendering, use expo-linear-gradient
  return {
    backgroundColor: colors[0],
  };
};
