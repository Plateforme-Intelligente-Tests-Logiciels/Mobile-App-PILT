import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface RadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
}

export const RadioButton = ({
  label,
  value,
  selected,
  onPress,
  icon,
  description,
  style,
}: RadioButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.content}>
        <View style={styles.labelContainer}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={SIZES.iconMd}
              color={selected ? COLORS.primary : COLORS.textSecondary}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </Text>
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    marginVertical: SIZES.sm,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  containerSelected: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.md,
    marginTop: SIZES.xs,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: SIZES.sm,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontBase,
    fontWeight: "500",
  },
  labelSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: SIZES.xs,
    fontWeight: "400",
  },
});
