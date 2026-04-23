import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  icon?: string;
}

export const Header = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = false,
  icon,
}: HeaderProps) => {
  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons
            name="chevron-back"
            size={SIZES.iconLg}
            color={COLORS.text}
          />
        </TouchableOpacity>
      )}
      {icon && (
        <Ionicons
          name={icon as any}
          size={SIZES.iconXl}
          color={COLORS.primary}
          style={styles.icon}
        />
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.xl,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: SIZES.md,
    zIndex: 10,
  },
  icon: {
    marginBottom: SIZES.md,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontBase,
    fontWeight: "400",
    textAlign: "center",
  },
});
