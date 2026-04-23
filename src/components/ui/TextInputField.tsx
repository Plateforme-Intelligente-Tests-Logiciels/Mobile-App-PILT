import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface TextInputFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  error?: string;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
}

export const TextInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  editable = true,
  style,
  icon,
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={SIZES.iconMd}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={SIZES.iconMd}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  label: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    marginBottom: SIZES.sm,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: SIZES.inputHeight,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SIZES.md,
    transitionDuration: "200ms",
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputBorderFocused,
    backgroundColor: COLORS.backgroundSecondary,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  icon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "400",
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  iconButton: {
    padding: SIZES.sm,
    marginLeft: SIZES.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSm,
    marginTop: SIZES.sm,
    fontWeight: "500",
  },
});
