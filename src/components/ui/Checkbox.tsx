import { COLORS, SIZES } from "@/constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CheckboxProps {
  value: boolean;
  onPress: () => void;
  label?: string;
}

export const Checkbox = ({ value, onPress, label }: CheckboxProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, value && styles.checkboxChecked]}
        onPress={onPress}
      >
        {value && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

import { TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: SIZES.radiusSm,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    fontWeight: "bold",
  },
  label: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "500",
  },
});
