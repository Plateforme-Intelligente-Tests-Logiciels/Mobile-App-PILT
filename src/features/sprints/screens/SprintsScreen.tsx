import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SIZES } from "@/constants";
import { useAuthStore } from "@/features/auth/store";
import { projectsService } from "@/services/projects";
import { sprintsService } from "@/services/sprints";
import { ProjetResponse, SprintResponse } from "@/types/api";

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PLANIFIE: { label: "Planifié", color: "#9ca3af", icon: "time-outline" },
  EN_COURS: { label: "En cours", color: "#f59e0b", icon: "flash" },
  CLOTURE: { label: "Clôturé", color: "#22c55e", icon: "checkmark-circle" },
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

export default function SprintsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const isScrumMaster = user?.role === "Scrum Master";

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );
  const [sprints, setSprints] = useState<SprintResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingS, setLoadingS] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNom, setNewNom] = useState("");
  const [newObjectif, setNewObjectif] = useState("");
  const [newDateDebut, setNewDateDebut] = useState("");
  const [newDateFin, setNewDateFin] = useState("");

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        await loadSprintsFor(data[0].id);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  async function loadSprintsFor(projectId: number) {
    setLoadingS(true);
    try {
      const data = asArray<SprintResponse>(
        await sprintsService.getAll(projectId),
      );
      setSprints(data);
    } catch {
      setSprints([]);
    } finally {
      setLoadingS(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    await loadSprintsFor(proj.id);
  }

  async function handleStartSprint(sprint: SprintResponse) {
    if (!selectedProject) return;
    try {
      const updated = await sprintsService.start(selectedProject.id, sprint.id);
      setSprints((prev) => prev.map((s) => (s.id === sprint.id ? updated : s)));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  async function handleCloseSprint(sprint: SprintResponse) {
    if (!selectedProject) return;
    Alert.alert("Clôturer", `Clôturer "${sprint.nom}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Clôturer",
        onPress: async () => {
          try {
            const updated = await sprintsService.close(
              selectedProject.id,
              sprint.id,
            );
            setSprints((prev) =>
              prev.map((s) => (s.id === sprint.id ? updated : s)),
            );
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  }

  async function handleCreate() {
    if (!selectedProject || !newNom.trim() || !newDateDebut || !newDateFin) {
      Alert.alert("Validation", "Remplissez le nom et les dates");
      return;
    }
    setCreating(true);
    try {
      const sprint = await sprintsService.create(selectedProject.id, {
        nom: newNom.trim(),
        objectif: newObjectif.trim() || undefined,
        date_debut: newDateDebut,
        date_fin: newDateFin,
      });
      setSprints((prev) => [sprint, ...prev]);
      setShowCreate(false);
      setNewNom("");
      setNewObjectif("");
      setNewDateDebut("");
      setNewDateFin("");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setCreating(false);
    }
  }

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
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Sprints</Text>
            <Text style={styles.pageSubtitle}>{sprints.length} sprint(s)</Text>
          </View>
          {isScrumMaster && selectedProject && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowCreate(true)}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.createBtnText}>Nouveau</Text>
            </TouchableOpacity>
          )}
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

            {loadingS ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : sprints.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="flash-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>Aucun sprint</Text>
              </View>
            ) : (
              sprints.map((sprint) => {
                const sm = STATUS_META[sprint.statut] ?? {
                  label: sprint.statut,
                  color: COLORS.textSecondary,
                  icon: "time-outline" as const,
                };
                return (
                  <View
                    key={sprint.id}
                    style={[
                      styles.sprintCard,
                      sprint.statut === "EN_COURS" && styles.sprintCardActive,
                    ]}
                  >
                    <View style={styles.sprintHeader}>
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: `${sm.color}22` },
                        ]}
                      >
                        <Ionicons name={sm.icon} size={16} color={sm.color} />
                      </View>
                      <View style={styles.sprintTitleWrap}>
                        <Text style={styles.sprintName}>{sprint.nom}</Text>
                        {sprint.objectif ? (
                          <Text style={styles.sprintObjectif}>
                            {sprint.objectif}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: `${sm.color}22` },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: sm.color }]}>
                          {sm.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      {sprint.date_debut && (
                        <View style={styles.metaItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.metaText}>
                            {sprint.date_debut} → {sprint.date_fin}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="document-text-outline"
                          size={12}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {sprint.nb_user_stories ?? 0} stories
                        </Text>
                      </View>
                    </View>

                    {isScrumMaster && (
                      <View style={styles.actionsRow}>
                        {sprint.statut === "PLANIFIE" && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleStartSprint(sprint)}
                          >
                            <Ionicons name="play" size={14} color="#22c55e" />
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: "#22c55e" },
                              ]}
                            >
                              Démarrer
                            </Text>
                          </TouchableOpacity>
                        )}
                        {sprint.statut === "EN_COURS" && (
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => handleCloseSprint(sprint)}
                          >
                            <Ionicons name="stop" size={14} color="#ef4444" />
                            <Text
                              style={[
                                styles.actionBtnText,
                                { color: "#ef4444" },
                              ]}
                            >
                              Clôturer
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouveau sprint</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {[
              {
                label: "Nom du sprint *",
                value: newNom,
                setter: setNewNom,
                placeholder: "Sprint 1",
              },
              {
                label: "Objectif",
                value: newObjectif,
                setter: setNewObjectif,
                placeholder: "Objectif du sprint...",
              },
              {
                label: "Date début * (AAAA-MM-JJ)",
                value: newDateDebut,
                setter: setNewDateDebut,
                placeholder: "2024-01-01",
              },
              {
                label: "Date fin * (AAAA-MM-JJ)",
                value: newDateFin,
                setter: setNewDateFin,
                placeholder: "2024-01-14",
              },
            ].map((field) => (
              <View key={field.label}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Créer le sprint</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  pageTitle: { color: COLORS.text, fontSize: SIZES.font2xl, fontWeight: "800" },
  pageSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
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
  sprintCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sprintCardActive: { borderColor: "#f59e0b44" },
  sprintHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
    justifyContent: "center",
  },
  sprintTitleWrap: { flex: 1 },
  sprintName: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
  sprintObjectif: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
  },
  statusText: { fontSize: SIZES.fontXs, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: SIZES.lg, marginBottom: SIZES.sm },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },
  actionsRow: {
    flexDirection: "row",
    gap: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: SIZES.sm,
  },
  actionBtnText: { fontSize: SIZES.fontSm, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    paddingBottom: SIZES.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  modalTitle: { color: COLORS.text, fontSize: SIZES.fontLg, fontWeight: "700" },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    marginBottom: SIZES.md,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: "center",
    marginTop: SIZES.sm,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
  },
});
