import { COLORS, SIZES } from "@/constants";
import React from "react";
import { StyleSheet, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated";
  style?: any;
}

export const Card = ({ children, variant = "default", style }: CardProps) => {
  return (
    <View
      style={[styles.card, variant === "elevated" && styles.elevated, style]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
});
