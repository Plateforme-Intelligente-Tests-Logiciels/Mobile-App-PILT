import { COLORS, SIZES } from "@/constants";
import React from "react";
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  size = "md",
  style,
  textStyle,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        size === "sm" && styles.sizeSm,
        size === "lg" && styles.sizeLg,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? COLORS.primary : COLORS.white}
          size={24}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.textOutline,
            size === "sm" && styles.textSm,
            size === "lg" && styles.textLg,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radiusLg,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  danger: {
    backgroundColor: COLORS.error,
  },

  // Sizes
  sizeSm: {
    height: 40,
  },
  sizeLg: {
    height: 56,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textSm: {
    fontSize: SIZES.fontSm,
    fontWeight: "500",
  },
  textLg: {
    fontSize: SIZES.fontLg,
    fontWeight: "600",
  },
});
