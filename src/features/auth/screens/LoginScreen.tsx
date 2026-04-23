import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextInputField } from "@/components/ui/TextInputField";
import { COLORS, SIZES } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks";

export const LoginScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Email invalide";
    }

    if (!password) {
      errors.password = "Mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit avoir au moins 6 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    try {
      clearError();
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Login error:", err);
    }
  }, [email, password, validateForm, login, clearError, router]);

  const handleGoogleLogin = useCallback(() => {
    console.log("Google login");
    // Implement Google OAuth
  }, []);

  const handleGitHubLogin = useCallback(() => {
    console.log("GitHub login");
    // Implement GitHub OAuth
  }, []);

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={SIZES.iconLg} color={COLORS.primary} />
            <Text style={styles.logoText}>AgileFlow</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Connectez-vous à votre compte Agile
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <View style={styles.errorContent}>
              <Ionicons
                name="alert-circle"
                size={SIZES.iconMd}
                color={COLORS.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Form */}
        <View style={styles.form}>
          <TextInputField
            label="Email Address"
            placeholder="name@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={validationErrors.email}
            icon="mail-outline"
          />

          <TextInputField
            label="Password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={validationErrors.password}
            icon="lock-closed-outline"
          />

          {/* Remember Me & Forgot Password */}
          <View style={styles.formFooter}>
            <Checkbox
              value={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              label="Remember me"
            />
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Login Button */}
          <Button
            label="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !email || !password}
            size="lg"
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="github" onPress={handleGitHubLogin} />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}> Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
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
    marginBottom: SIZES.xl,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  logoText: {
    fontSize: SIZES.fontXl,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: SIZES.sm,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: SIZES.font2xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SIZES.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: SIZES.fontBase,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },
  errorCard: {
    marginBottom: SIZES.lg,
    backgroundColor: COLORS.background,
    borderColor: COLORS.error,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.fontSm,
    marginLeft: SIZES.md,
    flex: 1,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  formFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  forgotPasswordLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.xl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginHorizontal: SIZES.md,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontBase,
    fontWeight: "400",
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
  },
});
