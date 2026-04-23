import { Button } from "@/components/ui/Button";
import { RadioButton } from "@/components/ui/RadioButton";
import { COLORS, SIZES } from "@/constants";
import { USER_ROLES } from "@/constants/roles";
import { UserRole } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SelectRoleScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      // Store selected role in a way that's accessible to next screens
      // For now, we'll navigate to login
      router.push("/(auth)/login");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Icon */}
        <View style={styles.header}>
          <Ionicons
            name="person-circle-outline"
            size={SIZES.iconXl * 2}
            color={COLORS.primary}
          />
          <Text style={styles.title}>Choisissez votre rôle</Text>
          <Text style={styles.subtitle}>
            Votre compte a été créé avec OAuth. Sélectionnez votre rôle pour
            terminer la configuration.
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          {USER_ROLES.map((role) => (
            <RadioButton
              key={role.label}
              label={role.label}
              value={role.label}
              selected={selectedRole === role.label}
              onPress={() => setSelectedRole(role.label as UserRole)}
              icon={role.icon}
              description={role.description}
            />
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: SIZES.lg }]}>
        <Button
          label="Continuer"
          onPress={handleContinue}
          disabled={!selectedRole}
          size="lg"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SIZES.lg,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SIZES.md,
    lineHeight: SIZES.fontBase * SIZES.lineHeightRelaxed,
  },
  rolesContainer: {
    marginBottom: SIZES.xl,
  },
  footer: {
    paddingHorizontal: SIZES.lg,
    backgroundColor: COLORS.background,
  },
});
