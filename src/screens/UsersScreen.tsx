import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SIZES } from "@/constants";
import { usersService } from "@/services/users";
import { UtilisateurResponse } from "@/types/api";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:   "#ef4444",
  PRODUCT_OWNER: "#a855f7",
  SCRUM_MASTER:  "#f59e0b",
  TESTEUR_QA:    "#06b6d4",
  DEVELOPPEUR:   "#22c55e",
};

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UtilisateurResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function load() {
    try {
      const data = await usersService.getAll();
      setUsers(data ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(user: UtilisateurResponse) {
    setActionLoading(user.id);
    try {
      if (user.is_active) {
        await usersService.deactivate(user.id);
      } else {
        await usersService.activate(user.id);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setActionLoading(null);
    }
  }

  function confirmDelete(user: UtilisateurResponse) {
    Alert.alert(
      "Supprimer l'utilisateur",
      `Confirmer la suppression de ${user.nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer", style: "destructive",
          onPress: async () => {
            setActionLoading(user.id);
            try {
              await usersService.delete(user.id);
              setUsers((prev) => prev.filter((u) => u.id !== user.id));
            } catch (e: any) {
              Alert.alert("Erreur", e.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }

  const roleColor = (code?: string) => ROLE_COLORS[code ?? ""] ?? COLORS.textSecondary;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + SIZES.lg,
          paddingHorizontal: SIZES.lg,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Utilisateurs</Text>
          <Text style={styles.pageSubtitle}>{users.length} compte(s) enregistré(s)</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: SIZES.xxl }} />
        ) : users.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        ) : (
          users.map((user) => {
            const rc = roleColor(user.role?.code);
            return (
              <View key={user.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: `${rc}33` }]}>
                    <Text style={[styles.avatarText, { color: rc }]}>
                      {getInitials(user.nom)}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.nom}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.metaRow}>
                      {user.role && (
                        <View style={[styles.pill, { backgroundColor: `${rc}22` }]}>
                          <Text style={[styles.pillText, { color: rc }]}>{user.role.nom}</Text>
                        </View>
                      )}
                      <View style={[styles.pill, { backgroundColor: user.is_active ? "#22c55e22" : "#ef444422" }]}>
                        <Text style={[styles.pillText, { color: user.is_active ? "#22c55e" : "#ef4444" }]}>
                          {user.is_active ? "Actif" : "Inactif"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {actionLoading === user.id ? (
                    <ActivityIndicator color={COLORS.primary} size="small" />
                  ) : (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: user.is_active ? "#ef444420" : "#22c55e20" }]}
                        onPress={() => toggleActive(user)}
                      >
                        <Ionicons
                          name={user.is_active ? "pause-circle-outline" : "play-circle-outline"}
                          size={20}
                          color={user.is_active ? "#ef4444" : "#22c55e"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#ef444415" }]}
                        onPress={() => confirmDelete(user)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { marginBottom: SIZES.lg },
  pageTitle: { color: COLORS.text, fontSize: SIZES.font2xl, fontWeight: "800" },
  pageSubtitle: { color: COLORS.textSecondary, fontSize: SIZES.fontSm, marginTop: 2 },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
  emptyText: { color: COLORS.textSecondary, fontSize: SIZES.fontBase },
  card: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44, height: 44, borderRadius: SIZES.radiusRound,
    alignItems: "center", justifyContent: "center", marginRight: SIZES.md,
  },
  avatarText: { fontSize: SIZES.fontSm, fontWeight: "700" },
  userInfo: { flex: 1 },
  userName: { color: COLORS.text, fontSize: SIZES.fontBase, fontWeight: "700" },
  userEmail: { color: COLORS.textSecondary, fontSize: SIZES.fontXs, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: SIZES.sm, marginTop: SIZES.sm, flexWrap: "wrap" },
  pill: { paddingHorizontal: SIZES.sm, paddingVertical: 2, borderRadius: SIZES.radiusSm },
  pillText: { fontSize: SIZES.fontXs, fontWeight: "600" },
  actions: { flexDirection: "row", gap: SIZES.sm },
  actionBtn: { width: 36, height: 36, borderRadius: SIZES.radiusMd, alignItems: "center", justifyContent: "center" },
});
