import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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
import {
    epicsService,
    modulesService,
    projectsService,
} from "@/services/projects";
import { storiesService } from "@/services/stories";
import {
    EpicResponse,
    ModuleResponse,
    ProjetResponse,
    UserStoryResponse,
} from "@/types/api";

const PRIORITY_META: Record<string, { color: string; label: string }> = {
  CRITIQUE: { color: "#ef4444", label: "Critique" },
  HAUTE: { color: "#f59e0b", label: "Haute" },
  MOYENNE: { color: "#3b82f6", label: "Moyenne" },
  BASSE: { color: "#22c55e", label: "Basse" },
};

const STATUS_OPTIONS: {
  value: UserStoryResponse["statut"];
  label: string;
  color: string;
}[] = [
  { value: "A_FAIRE", label: "À faire", color: "#9ca3af" },
  { value: "EN_COURS", label: "En cours", color: "#f59e0b" },
  { value: "A_TESTER", label: "À tester", color: "#06b6d4" },
  { value: "TERMINE", label: "Terminé", color: "#22c55e" },
];

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

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = parseInt(user?.id ?? "0");

  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjetResponse | null>(
    null,
  );

  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);

  const [epics, setEpics] = useState<EpicResponse[]>([]);
  const [selectedEpicIds, setSelectedEpicIds] = useState<number[]>([]);

  const [stories, setStories] = useState<UserStoryResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingStories, setLoadingStories] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMine, setShowMine] = useState(true);

  const selectedEpicObjects = useMemo(
    () => epics.filter((e) => selectedEpicIds.includes(e.id)),
    [epics, selectedEpicIds],
  );

  async function loadProjects() {
    try {
      const data = asArray<ProjetResponse>(await projectsService.getMember());
      setProjects(data);
      if (data.length > 0) {
        await selectProject(data[0]);
      } else {
        setSelectedProject(null);
        setModules([]);
        setEpics([]);
        setStories([]);
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoadingProjects(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(proj: ProjetResponse) {
    setSelectedProject(proj);
    setStories([]);
    setEpics([]);

    try {
      const mods = asArray<ModuleResponse>(
        await modulesService.getAll(proj.id),
      );
      setModules(mods);

      const defaultModuleIds = mods.length > 0 ? [mods[0].id] : [];
      setSelectedModuleIds(defaultModuleIds);

      if (defaultModuleIds.length === 0) {
        setSelectedEpicIds([]);
        return;
      }

      await loadEpicsAndStories(proj.id, defaultModuleIds);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
      setModules([]);
      setSelectedModuleIds([]);
      setEpics([]);
      setSelectedEpicIds([]);
      setStories([]);
    }
  }

  async function loadEpicsAndStories(projectId: number, moduleIds: number[]) {
    const epicResults = await Promise.allSettled(
      moduleIds.map((moduleId) => epicsService.getAll(projectId, moduleId)),
    );

    const nextEpics = epicResults
      .filter(
        (r): r is PromiseFulfilledResult<EpicResponse[]> =>
          r.status === "fulfilled",
      )
      .flatMap((r) => asArray<EpicResponse>(r.value));

    const uniqueEpics = Array.from(
      new Map(nextEpics.map((e) => [e.id, e])).values(),
    );
    setEpics(uniqueEpics);

    const defaultEpicIds = uniqueEpics.length > 0 ? [uniqueEpics[0].id] : [];
    setSelectedEpicIds(defaultEpicIds);

    await loadStoriesForEpics(
      projectId,
      uniqueEpics.filter((e) => defaultEpicIds.includes(e.id)),
    );
  }

  async function loadStoriesForEpics(
    projectId: number,
    selectedEpicsInput: EpicResponse[],
  ) {
    if (selectedEpicsInput.length === 0) {
      setStories([]);
      return;
    }

    setLoadingStories(true);
    try {
      const storyResults = await Promise.allSettled(
        selectedEpicsInput.map((epic) =>
          storiesService.getForEpic(projectId, epic.module_id, epic.id),
        ),
      );

      const mergedStories = storyResults
        .filter(
          (r): r is PromiseFulfilledResult<UserStoryResponse[]> =>
            r.status === "fulfilled",
        )
        .flatMap((r) => asArray<UserStoryResponse>(r.value));

      const uniqueStories = Array.from(
        new Map(mergedStories.map((story) => [story.id, story])).values(),
      );

      setStories(uniqueStories);
    } catch {
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  }

  async function toggleModule(moduleId: number) {
    if (!selectedProject) return;

    const nextModuleIds = selectedModuleIds.includes(moduleId)
      ? selectedModuleIds.filter((id) => id !== moduleId)
      : [...selectedModuleIds, moduleId];

    setSelectedModuleIds(nextModuleIds);

    if (nextModuleIds.length === 0) {
      setEpics([]);
      setSelectedEpicIds([]);
      setStories([]);
      return;
    }

    await loadEpicsAndStories(selectedProject.id, nextModuleIds);
  }

  async function toggleEpic(epicId: number) {
    if (!selectedProject) return;

    const nextEpicIds = selectedEpicIds.includes(epicId)
      ? selectedEpicIds.filter((id) => id !== epicId)
      : [...selectedEpicIds, epicId];

    setSelectedEpicIds(nextEpicIds);
    await loadStoriesForEpics(
      selectedProject.id,
      epics.filter((e) => nextEpicIds.includes(e.id)),
    );
  }

  async function updateStatus(
    story: UserStoryResponse,
    newStatus: UserStoryResponse["statut"],
  ) {
    if (!selectedProject || !story.epic_id) {
      Alert.alert("Info", "Impossible de modifier cette story");
      return;
    }

    const moduleId =
      story.module_id ?? epics.find((e) => e.id === story.epic_id)?.module_id;

    try {
      const updated = await storiesService.updateStatus(
        selectedProject.id,
        moduleId,
        story.epic_id,
        story.id,
        newStatus,
      );
      setStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  }

  const displayed = showMine
    ? stories.filter((s) => s.assignee?.id === userId)
    : stories;

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
        <Text style={styles.pageTitle}>User Stories</Text>

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

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Modules</Text>
                <Text style={styles.sectionCount}>
                  {selectedModuleIds.length} sélectionné(s)
                </Text>
              </View>
              <View style={styles.pillGrid}>
                {modules.map((module) => {
                  const isSelected = selectedModuleIds.includes(module.id);
                  return (
                    <TouchableOpacity
                      key={module.id}
                      style={[
                        styles.filterPill,
                        isSelected && styles.filterPillActive,
                      ]}
                      onPress={() => toggleModule(module.id)}
                    >
                      <Ionicons
                        name={
                          isSelected ? "checkbox-outline" : "square-outline"
                        }
                        size={16}
                        color={
                          isSelected ? COLORS.primary : COLORS.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.filterPillTextActive,
                        ]}
                      >
                        {module.nom}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Épics</Text>
                <Text style={styles.sectionCount}>
                  {selectedEpicIds.length} sélectionné(s)
                </Text>
              </View>
              <View style={styles.pillGrid}>
                {epics.map((epic) => {
                  const isSelected = selectedEpicIds.includes(epic.id);
                  return (
                    <TouchableOpacity
                      key={epic.id}
                      style={[
                        styles.filterPill,
                        styles.epicPill,
                        isSelected && styles.epicPillActive,
                      ]}
                      onPress={() => toggleEpic(epic.id)}
                    >
                      <Ionicons
                        name={
                          isSelected ? "checkbox-outline" : "square-outline"
                        }
                        size={16}
                        color={isSelected ? "#d8b4fe" : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.filterPillText,
                          isSelected && styles.epicPillTextActive,
                        ]}
                      >
                        {epic.nom}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, showMine && styles.toggleBtnActive]}
                onPress={() => setShowMine(true)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    showMine && styles.toggleBtnTextActive,
                  ]}
                >
                  Mes stories
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !showMine && styles.toggleBtnActive]}
                onPress={() => setShowMine(false)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    !showMine && styles.toggleBtnTextActive,
                  ]}
                >
                  Toutes
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.countText}>
              User Stories ({displayed.length})
            </Text>

            {loadingStories ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: SIZES.xl }}
              />
            ) : displayed.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>
                  {showMine ? "Aucune story assignée" : "Aucune story"}
                </Text>
              </View>
            ) : (
              displayed.map((story) => {
                const pm = PRIORITY_META[story.priorite] ?? {
                  color: COLORS.textSecondary,
                  label: story.priorite,
                };

                return (
                  <View key={story.id} style={styles.storyCard}>
                    <View style={styles.storyHeader}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: pm.color },
                        ]}
                      />
                      <Text style={styles.storyTitle}>{story.titre}</Text>
                      {story.points !== undefined && (
                        <View style={styles.pointsBadge}>
                          <Text style={styles.pointsText}>{story.points}</Text>
                        </View>
                      )}
                    </View>

                    {story.description && (
                      <Text style={styles.storyDesc} numberOfLines={2}>
                        {story.description}
                      </Text>
                    )}

                    {story.assignee && (
                      <View style={styles.assigneeRow}>
                        <Ionicons
                          name="person-outline"
                          size={12}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.assigneeText}>
                          {story.assignee.nom}
                        </Text>
                      </View>
                    )}

                    <View style={styles.statusRow}>
                      {STATUS_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.statusBtn,
                            story.statut === opt.value && {
                              backgroundColor: `${opt.color}33`,
                              borderColor: opt.color,
                            },
                          ]}
                          onPress={() => updateStatus(story, opt.value)}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              story.statut === opt.value && {
                                color: opt.color,
                              },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
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

  sectionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontLg,
    fontWeight: "700",
  },
  sectionCount: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },

  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: SIZES.sm },
  filterPill: {
    minWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.background,
  },
  filterPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  filterPillText: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "600",
  },
  filterPillTextActive: { color: "#93c5fd" },
  epicPill: { borderColor: "#3b2a52" },
  epicPillActive: { borderColor: "#a855f7", backgroundColor: "#a855f722" },
  epicPillTextActive: { color: "#d8b4fe" },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 4,
    marginBottom: SIZES.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleBtnText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  toggleBtnTextActive: { color: COLORS.white },

  countText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.md,
  },
  emptyWrap: { alignItems: "center", paddingTop: SIZES.xxl, gap: SIZES.md },
  emptyText: { color: COLORS.textSecondary, fontSize: SIZES.fontBase },

  storyCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  storyTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  pointsBadge: {
    backgroundColor: `${COLORS.primary}22`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  pointsText: {
    color: COLORS.primary,
    fontSize: SIZES.fontXs,
    fontWeight: "700",
  },
  storyDesc: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.sm,
  },
  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SIZES.sm,
  },
  assigneeText: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },
  statusRow: { flexDirection: "row", gap: SIZES.sm, flexWrap: "wrap" },
  statusBtn: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  statusBtnText: {
    fontSize: SIZES.fontXs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
