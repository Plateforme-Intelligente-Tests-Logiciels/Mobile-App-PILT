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
import { useAuthStore } from "@/features/auth/store";
import { projectsService } from "@/services/projects";
import { cahierTestsService, unitTestsService } from "@/services/tests";
import {
    CahierTestResponse,
    CasTestResponse,
    ProjetResponse,
    UnitTestResponse,
} from "@/types/api";

type TestTab = "cahier" | "unitaires";

const CAS_STATUS_META: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  NON_EXECUTE: {
    label: "À exécuter",
    color: "#9ca3af",
    icon: "ellipse-outline",
  },
  PASSE: { label: "Passé", color: "#22c55e", icon: "checkmark-circle" },
  ECHEC: { label: "Échoué", color: "#ef4444", icon: "close-circle" },
  BLOQUE: { label: "Bloqué", color: "#f59e0b", icon: "warning" },
};

const UNIT_STATUS_META: Record<
  string,
  { color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  EN_ATTENTE: { color: "#9ca3af", icon: "time-outline" },
  PASSE: { color: "#22c55e", icon: "checkmark-circle" },
  ECHEC: { color: "#ef4444", icon: "close-circle" },
  IGNORE: { color: "#f59e0b", icon: "remove-circle-outline" },
};

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [record.items, record.results, record.data, record.logs];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
  }
  return [];
}

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isDeveloper = user?.role === "Développeur";

  const [activeTab, setActiveTab] = useState<TestTab>(
    isDeveloper ? "unitaires" : "cahier",
  );
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [cahier, setCahier] = useState<CahierTestResponse | null>(null);
  const [casTests, setCasTests] = useState<CasTestResponse[]>([]);
  const [unitTests, setUnitTests] = useState<UnitTestResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        await loadTestsFor(data[0].id);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadTestsFor(projectId: number) {
    setLoadingTests(true);
    try {
      const [cahierData, unitData] = await Promise.allSettled([
        cahierTestsService.getDetail(projectId),
        unitTestsService.getAll(projectId),
      ]);
      if (cahierData.status === "fulfilled") {
        setCahier(cahierData.value);
        setCasTests(asArray<CasTestResponse>(cahierData.value?.cas_tests));
      }
      if (unitData.status === "fulfilled") {
        setUnitTests(asArray<UnitTestResponse>(unitData.value));
      }
    } finally {
      setLoadingTests(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    await loadTestsFor(proj.id);
  }

  async function updateCasStatus(
    cas: CasTestResponse,
    statut: CasTestResponse["statut"],
  ) {
    if (!cahier || !selectedProject) return;
    try {
      const updated = await cahierTestsService.updateCasTest(
        selectedProject.id,
        cahier.id,
        cas.id,
        { statut },
      );
      setCasTests((prev) => prev.map((c) => (c.id === cas.id ? updated : c)));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  async function executeUnit(test: UnitTestResponse) {
    if (!selectedProject) return;
    try {
      const updated = await unitTestsService.execute(
        selectedProject.id,
        test.id,
      );
      setUnitTests((prev) => prev.map((t) => (t.id === test.id ? updated : t)));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  const passedCount = casTests.filter((c) => c.statut === "PASSE").length;
  const failedCount = casTests.filter((c) => c.statut === "ECHEC").length;
  const progressPct =
    casTests.length > 0 ? Math.round((passedCount / casTests.length) * 100) : 0;

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
            onRefresh={() => {
              setRefreshing(true);
              loadProjects();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.pageTitle}>Tests</Text>

        <View style={styles.tabRow}>
          {(!isDeveloper || true) && (
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "cahier" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("cahier")}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "cahier" && styles.tabBtnTextActive,
                ]}
              >
                Cahier de tests
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "unitaires" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("unitaires")}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === "unitaires" && styles.tabBtnTextActive,
              ]}
            >
              Tests unitaires
            </Text>
          </TouchableOpacity>
        </View>

        {loadingProjects ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginTop: SIZES.xxl }}
          />
        ) : projects.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Aucun projet disponible</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.projectPicker}
            >
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.projectChip,
                    selectedProject?.id === p.id && styles.projectChipActive,
                  ]}
                  onPress={() => selectProject(p)}
                >
                  <Text
                    style={[
                      styles.projectChipText,
                      selectedProject?.id === p.id &&
                        styles.projectChipTextActive,
                    ]}
                  >
                    {p.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {loadingTests ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : activeTab === "cahier" ? (
              <>
                {cahier ? (
                  <View style={styles.cahierSummary}>
                    <View style={styles.cahierHeader}>
                      <Text style={styles.cahierTitle}>{cahier.titre}</Text>
                      <View
                        style={[styles.pill, { backgroundColor: "#06b6d422" }]}
                      >
                        <Text style={[styles.pillText, { color: "#06b6d4" }]}>
                          {cahier.statut}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>
                        Progression: {progressPct}%
                      </Text>
                      <Text style={styles.progressStats}>
                        ✅ {passedCount} · ❌ {failedCount} · Total{" "}
                        {casTests.length}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progressPct}%` as any },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}

                {casTests.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <Ionicons
                      name="clipboard-outline"
                      size={48}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.emptyText}>Aucun cas de test</Text>
                  </View>
                ) : (
                  casTests.map((cas) => {
                    const sm =
                      CAS_STATUS_META[cas.statut] ??
                      CAS_STATUS_META.NON_EXECUTE;
                    return (
                      <View key={cas.id} style={styles.casCard}>
                        <View style={styles.casHeader}>
                          <Ionicons name={sm.icon} size={18} color={sm.color} />
                          <Text style={styles.casTitle}>{cas.titre}</Text>
                        </View>
                        {cas.description && (
                          <Text style={styles.casDesc}>{cas.description}</Text>
                        )}
                        <View style={styles.casActions}>
                          {(
                            [
                              "PASSE",
                              "ECHEC",
                              "BLOQUE",
                            ] as CasTestResponse["statut"][]
                          ).map((s) => (
                            <TouchableOpacity
                              key={s}
                              style={[
                                styles.casBtn,
                                cas.statut === s && {
                                  backgroundColor: `${CAS_STATUS_META[s].color}33`,
                                },
                              ]}
                              onPress={() => updateCasStatus(cas, s)}
                            >
                              <Text
                                style={[
                                  styles.casBtnText,
                                  { color: CAS_STATUS_META[s].color },
                                ]}
                              >
                                {CAS_STATUS_META[s].label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            ) : unitTests.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="code-slash-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>Aucun test unitaire</Text>
              </View>
            ) : (
              unitTests.map((test) => {
                const sm =
                  UNIT_STATUS_META[test.statut] ?? UNIT_STATUS_META.EN_ATTENTE;
                return (
                  <View key={test.id} style={styles.unitCard}>
                    <View style={styles.unitHeader}>
                      <Ionicons name={sm.icon} size={16} color={sm.color} />
                      <Text style={styles.unitName}>{test.nom}</Text>
                      {isDeveloper && (
                        <TouchableOpacity
                          style={styles.execBtn}
                          onPress={() => executeUnit(test)}
                        >
                          <Ionicons
                            name="play"
                            size={14}
                            color={COLORS.primary}
                          />
                          <Text style={styles.execBtnText}>Exécuter</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {test.description && (
                      <Text style={styles.unitDesc}>{test.description}</Text>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  pageTitle: {
    color: COLORS.text,
    fontSize: SIZES.font2xl,
    fontWeight: "800",
    marginBottom: SIZES.lg,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  tabBtnTextActive: { color: COLORS.white },
  projectPicker: { marginBottom: SIZES.md },
  projectChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SIZES.sm,
  },
  projectChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  projectChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  projectChipTextActive: { color: COLORS.white },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
  emptyText: { color: COLORS.textSecondary, fontSize: SIZES.fontBase },
  cahierSummary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  cahierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SIZES.md,
  },
  cahierTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
    flex: 1,
    marginRight: SIZES.sm,
  },
  pill: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  pillText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.sm,
  },
  progressLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  progressStats: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.inputBorder,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  casCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  casHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  casTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    flex: 1,
  },
  casDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.sm,
  },
  casActions: { flexDirection: "row", gap: SIZES.sm, flexWrap: "wrap" },
  casBtn: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  casBtnText: { fontSize: SIZES.fontXs, fontWeight: "600" },
  unitCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  unitName: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
    flex: 1,
  },
  unitDesc: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },
  execBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  execBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
});
