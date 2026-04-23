import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

interface SocialButtonProps {
  provider: "google" | "github";
  onPress: () => void;
  loading?: boolean;
}

export const SocialButton = ({
  provider,
  onPress,
  loading = false,
}: SocialButtonProps) => {
  const iconName = provider === "google" ? "logo-google" : "logo-github";
  const iconColor = provider === "google" ? "#EA4335" : COLORS.text;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} size={24} />
      ) : (
        <Ionicons
          name={iconName as any}
          size={SIZES.iconLg}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: SIZES.inputHeight,
    height: SIZES.inputHeight,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    justifyContent: "center",
    alignItems: "center",
  },
});
