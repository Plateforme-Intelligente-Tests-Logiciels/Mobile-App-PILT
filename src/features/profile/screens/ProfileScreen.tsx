import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SIZES } from "@/constants";
import { useAuthStore } from "@/features/auth/store";
import { usersService } from "@/services/users";
import { UtilisateurResponse } from "@/types/api";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:   "#ef4444",
  PRODUCT_OWNER: "#a855f7",
  SCRUM_MASTER:  "#f59e0b",
  TESTEUR_QA:    "#06b6d4",
  DEVELOPPEUR:   "#22c55e",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

interface ActionRow {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
}

function ActionItem({ item }: { item: ActionRow }) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={item.onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: item.danger ? "#ef444420" : `${COLORS.primary}20` }]}>
        <Ionicons name={item.icon} size={20} color={item.danger ? "#ef4444" : COLORS.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, item.danger && { color: "#ef4444" }]}>{item.label}</Text>
        {item.sublabel && <Text style={styles.actionSublabel}>{item.sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UtilisateurResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersService.getMe()
      .then((data) => setProfile(data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion", style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  const displayName = profile?.nom ?? user?.fullName ?? "Utilisateur";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const displayRole = profile?.role ?? null;
  const roleCode = displayRole?.code ?? "";
  const roleColor = ROLE_COLORS[roleCode] ?? COLORS.primary;

  const actions: ActionRow[] = [
    {
      icon: "lock-closed-outline",
      label: "Sécurité",
      sublabel: "Changer le mot de passe",
      onPress: () => Alert.alert("Info", "Fonctionnalité disponible prochainement"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      sublabel: "Paramètres de notifications",
      onPress: () => Alert.alert("Info", "Fonctionnalité disponible prochainement"),
    },
    {
      icon: "information-circle-outline",
      label: "À propos",
      sublabel: "PILT AgileFlow v1.0",
      onPress: () => {},
    },
    {
      icon: "log-out-outline",
      label: "Déconnexion",
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SIZES.lg,
          paddingHorizontal: SIZES.lg,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profil</Text>

        <View style={styles.profileCard}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <View style={[styles.avatarBig, { backgroundColor: `${roleColor}33` }]}>
                <Text style={[styles.avatarBigText, { color: roleColor }]}>
                  {getInitials(displayName)}
                </Text>
              </View>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{displayEmail}</Text>
              {displayRole && (
                <View style={[styles.rolePill, { backgroundColor: `${roleColor}22` }]}>
                  <Text style={[styles.roleText, { color: roleColor }]}>{displayRole.nom}</Text>
                </View>
              )}
              {profile?.telephone ? (
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.phoneText}>{profile.telephone}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.actionsCard}>
          {actions.map((item) => (
            <ActionItem key={item.label} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageTitle: {
    color: COLORS.text, fontSize: SIZES.font2xl, fontWeight: "800", marginBottom: SIZES.lg,
  },
  profileCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.xl,
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  avatarBig: {
    width: 80, height: 80, borderRadius: SIZES.radiusRound,
    alignItems: "center", justifyContent: "center", marginBottom: SIZES.md,
  },
  avatarBigText: { fontSize: SIZES.font2xl, fontWeight: "800" },
  profileName: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: "700", marginBottom: 4 },
  profileEmail: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, marginBottom: SIZES.md },
  rolePill: {
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm, marginBottom: SIZES.sm,
  },
  roleText: { fontSize: SIZES.fontSm, fontWeight: "700" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: SIZES.sm },
  phoneText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },
  actionsCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row", alignItems: "center",
    padding: SIZES.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder,
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: SIZES.radiusMd,
    alignItems: "center", justifyContent: "center", marginRight: SIZES.md,
  },
  actionContent: { flex: 1 },
  actionLabel: { color: COLORS.text, fontSize: SIZES.fontBase, fontWeight: "600" },
  actionSublabel: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, marginTop: 2 },
});
