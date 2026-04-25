import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SIZES } from "@/constants";
import { useAuthStore } from "@/features/auth/store";
import { logsService } from "@/services/logs";
import { projectsService } from "@/services/projects";
import { reportsService } from "@/services/reports";
import { sprintsService } from "@/services/sprints";
import { storiesService } from "@/services/stories";
import { cahierTestsService } from "@/services/tests";
import { rolesService, usersService } from "@/services/users";
import type {
    DashboardActivity,
    ProjetResponse,
    SprintResponse,
    UserStoryResponse,
} from "@/types/api";
import { UserRole } from "@/types/auth";

interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
}

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

function normalizeDashboardActivity(value: unknown): DashboardActivity | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const labels = asArray<string>(record.labels);
  const connexions = asArray<number>(record.connexions);
  const tests = asArray<number>(record.tests);

  return { labels, connexions, tests };
}

function StatCard({ item }: { item: StatItem }) {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconWrap, { backgroundColor: `${item.tone}22` }]}
      >
        <Ionicons name={item.icon} size={18} color={item.tone} />
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
}

function HeroCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroEyebrow}>{eyebrow}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}22`, borderColor: `${color}44` },
      ]}
    >
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return <Text style={styles.emptyText}>{message}</Text>;
}

function SuperAdminDashboard() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({
    users: "—",
    roles: "—",
    logs: "—",
    health: "—",
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [activityTrend, setActivityTrend] = useState<DashboardActivity | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [users, roles, logStats, audit, dashboardActivity] =
        await Promise.allSettled([
          usersService.getAll(),
          rolesService.getAll(),
          logsService.getStats(),
          logsService.getAudit({ limit: 5 }),
          logsService.getDashboardActivity(7),
        ]);
      if (users.status === "fulfilled") {
        setStats((prev) => ({
          ...prev,
          users: String(users.value?.length ?? "—"),
        }));
      }
      if (roles.status === "fulfilled") {
        setStats((prev) => ({
          ...prev,
          roles: String(roles.value?.length ?? "—"),
        }));
      }
      if (logStats.status === "fulfilled" && logStats.value) {
        setStats((prev) => ({
          ...prev,
          logs: String(logStats.value.total_today ?? "—"),
          health: logStats.value.system_health
            ? `${logStats.value.system_health}%`
            : "—",
        }));
      }
      if (audit.status === "fulfilled") {
        setActivities(asArray(audit.value));
      } else {
        setActivities([]);
      }
      if (dashboardActivity.status === "fulfilled" && dashboardActivity.value) {
        setActivityTrend(normalizeDashboardActivity(dashboardActivity.value));
      } else {
        setActivityTrend(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statItems: StatItem[] = [
    {
      label: "Utilisateurs",
      value: stats.users,
      icon: "people",
      tone: COLORS.primary,
    },
    {
      label: "Rôles",
      value: stats.roles,
      icon: "shield-checkmark",
      tone: "#a855f7",
    },
    {
      label: "Logs aujourd'hui",
      value: stats.logs,
      icon: "receipt",
      tone: "#38bdf8",
    },
    {
      label: "Santé système",
      value: stats.health,
      icon: "pulse",
      tone: "#f59e0b",
    },
  ];

  return (
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
            load();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <HeroCard
        eyebrow="Super Admin"
        title="Tableau de bord plateforme"
        subtitle="Vue globale des utilisateurs, rôles, activité et état de la plateforme PILT."
      />
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      <SectionCard title="Activité récente">
        {activities.length === 0 ? (
          <EmptyState message="Aucune activité récente" />
        ) : (
          activities.slice(0, 5).map((a, i) => (
            <View key={a.id ?? i} style={styles.activityRow}>
              <View style={styles.activityBullet} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  {a.action ?? a.message}
                </Text>
                <Text style={styles.activityDetail}>
                  {a.user_nom ?? a.source ?? ""}
                </Text>
              </View>
              <Text style={styles.activityTime}>
                {a.timestamp
                  ? new Date(a.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Activité plateforme (7 jours)">
        {!activityTrend || activityTrend.labels.length === 0 ? (
          <EmptyState message="Aucune donnée d'activité disponible" />
        ) : (
          activityTrend.labels.map((label, idx) => {
            const connexions = activityTrend.connexions[idx] ?? 0;
            const tests = activityTrend.tests[idx] ?? 0;
            return (
              <View key={`${label}-${idx}`} style={styles.activityMetricRow}>
                <Text style={styles.activityMetricLabel}>{label}</Text>
                <Text style={styles.activityMetricValue}>
                  {connexions} connexions · {tests} tests
                </Text>
              </View>
            );
          })
        )}
      </SectionCard>
    </ScrollView>
  );
}

function ProductOwnerDashboard() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [projectStats, setProjectStats] = useState<
    Record<number, { nb_modules: number; nb_sprints: number }>
  >({});
  const [storiesCount, setStoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await projectsService.getMine();
      setProjects(data ?? []);

      const statsEntries = await Promise.allSettled(
        (data ?? []).map(async (project) => {
          const [stats, backlog] = await Promise.all([
            projectsService.getStats(project.id),
            storiesService.getBacklog(project.id),
          ]);
          return {
            projectId: project.id,
            nb_modules: stats.nb_modules ?? 0,
            nb_sprints: stats.nb_sprints ?? 0,
            stories: asArray<UserStoryResponse>(backlog).length,
          };
        }),
      );

      const nextStats: Record<
        number,
        { nb_modules: number; nb_sprints: number }
      > = {};
      let totalStories = 0;
      for (const result of statsEntries) {
        if (result.status === "fulfilled") {
          nextStats[result.value.projectId] = {
            nb_modules: result.value.nb_modules,
            nb_sprints: result.value.nb_sprints,
          };
          totalStories += result.value.stories;
        }
      }

      setProjectStats(nextStats);
      setStoriesCount(totalStories);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statItems: StatItem[] = [
    {
      label: "Projets",
      value: String(projects.length),
      icon: "folder",
      tone: COLORS.primary,
    },
    {
      label: "Projets actifs",
      value: String(projects.filter((p) => p.statut === "ACTIF").length),
      icon: "flash",
      tone: "#22c55e",
    },
    {
      label: "User Stories",
      value: String(storiesCount),
      icon: "document-text",
      tone: "#a855f7",
    },
  ];

  return (
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
            load();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <HeroCard
        eyebrow="Product Owner"
        title="Tableau de bord produit"
        subtitle="Gérez vos projets, epics et user stories."
      />
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      <SectionCard title="Mes projets récents">
        {projects.length === 0 ? (
          <EmptyState message="Aucun projet trouvé. Créez votre premier projet." />
        ) : (
          projects.slice(0, 5).map((p) => (
            <View key={p.id} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.nom}</Text>
                <Text style={styles.projectDetail}>
                  {projectStats[p.id]?.nb_modules ?? 0} modules ·{" "}
                  {projectStats[p.id]?.nb_sprints ?? 0} sprints
                </Text>
              </View>
              <StatusBadge
                label={p.statut}
                color={
                  p.statut === "ACTIF"
                    ? "#22c55e"
                    : p.statut === "TERMINE"
                      ? "#3b82f6"
                      : "#9ca3af"
                }
              />
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}

function ScrumMasterDashboard() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [activeSprint, setActiveSprint] = useState<SprintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const projs = await projectsService.getMember();
      setProjects(projs ?? []);
      if (projs && projs.length > 0) {
        const sprint = await sprintsService.getActive(projs[0].id);
        setActiveSprint(sprint);
      }
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.message ?? "Impossible de charger le tableau de bord",
      );
      setProjects([]);
      setActiveSprint(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statItems: StatItem[] = [
    {
      label: "Projets",
      value: String(projects.length),
      icon: "folder",
      tone: COLORS.primary,
    },
    {
      label: "Sprint actif",
      value: activeSprint ? "1" : "0",
      icon: "flash",
      tone: "#f59e0b",
    },
    {
      label: "Stories sprint",
      value: String(activeSprint?.nb_user_stories ?? 0),
      icon: "document-text",
      tone: "#22c55e",
    },
  ];

  return (
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
            load();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <HeroCard
        eyebrow="Scrum Master"
        title="Tableau de bord sprint"
        subtitle="Gérez les sprints, le backlog et la vélocité de l'équipe."
      />
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      {activeSprint && (
        <SectionCard title="Sprint en cours">
          <View style={styles.sprintCard}>
            <Text style={styles.sprintName}>{activeSprint.nom}</Text>
            {activeSprint.objectif ? (
              <Text style={styles.sprintObjectif}>{activeSprint.objectif}</Text>
            ) : null}
            <View style={styles.sprintMeta}>
              <Text style={styles.sprintDate}>
                {activeSprint.date_debut} → {activeSprint.date_fin}
              </Text>
              <StatusBadge label={activeSprint.statut} color="#f59e0b" />
            </View>
          </View>
        </SectionCard>
      )}
      <SectionCard title="Projets">
        {projects.length === 0 ? (
          <EmptyState message="Aucun projet assigné" />
        ) : (
          projects.slice(0, 4).map((p) => (
            <View key={p.id} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.nom}</Text>
                <Text style={styles.projectDetail}>
                  {p.membres?.length ?? 0} membres
                </Text>
              </View>
              <StatusBadge
                label={p.statut}
                color={p.statut === "ACTIF" ? "#22c55e" : "#9ca3af"}
              />
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}

function QATesterDashboard() {
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<ProjetResponse[]>([]);
  const [qaStats, setQaStats] = useState({
    cahiers: 0,
    rapports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await projectsService.getMember();
      setProjects(data ?? []);

      const details = await Promise.allSettled(
        (data ?? []).map(async (project) => {
          const [cahier, reports] = await Promise.all([
            cahierTestsService.get(project.id),
            reportsService.getAll(project.id),
          ]);

          return {
            cahier: !!cahier,
            reports: asArray(reports).length,
          };
        }),
      );

      let cahiersCount = 0;
      let reportsCount = 0;
      for (const result of details) {
        if (result.status === "fulfilled") {
          if (result.value.cahier) cahiersCount += 1;
          reportsCount += result.value.reports;
        }
      }

      setQaStats({
        cahiers: cahiersCount,
        rapports: reportsCount,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statItems: StatItem[] = [
    {
      label: "Projets",
      value: String(projects.length),
      icon: "folder",
      tone: COLORS.primary,
    },
    {
      label: "Cahiers de tests",
      value: String(qaStats.cahiers),
      icon: "clipboard",
      tone: "#06b6d4",
    },
    {
      label: "Rapports QA",
      value: String(qaStats.rapports),
      icon: "bar-chart",
      tone: "#ec4899",
    },
  ];

  return (
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
            load();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <HeroCard
        eyebrow="Testeur QA"
        title="Tableau de bord qualité"
        subtitle="Exécutez les tests, capturez les résultats et générez des rapports QA."
      />
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      <SectionCard title="Projets assignés">
        {projects.length === 0 ? (
          <EmptyState message="Aucun projet assigné" />
        ) : (
          projects.slice(0, 5).map((p) => (
            <View key={p.id} style={styles.projectRow}>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName}>{p.nom}</Text>
                <Text style={styles.projectDetail}>
                  {p.nb_user_stories ?? 0} stories à tester
                </Text>
              </View>
              <StatusBadge
                label={p.statut}
                color={p.statut === "ACTIF" ? "#22c55e" : "#9ca3af"}
              />
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}

function DeveloperDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [stories, setStories] = useState<
    Array<UserStoryResponse & { projectName?: string }>
  >([]);
  const [activeSprintsCount, setActiveSprintsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const projs = await projectsService.getMember();
      if (!projs || projs.length === 0) {
        setStories([]);
        setActiveSprintsCount(0);
        return;
      }

      const userId = parseInt(user?.id ?? "0");

      const [allBacklogs, activeSprints] = await Promise.all([
        Promise.allSettled(
          projs.map(async (p) => {
            const backlog = await storiesService.getBacklog(p.id);
            return {
              projectId: p.id,
              projectName: p.nom,
              stories: asArray<UserStoryResponse>(backlog),
            };
          }),
        ),
        Promise.allSettled(projs.map((p) => sprintsService.getActive(p.id))),
      ]);

      const assignedStories = allBacklogs
        .filter(
          (
            r,
          ): r is PromiseFulfilledResult<{
            projectId: number;
            projectName: string;
            stories: UserStoryResponse[];
          }> => r.status === "fulfilled",
        )
        .flatMap((r) =>
          r.value.stories
            .filter((s) => s.assignee?.id === userId)
            .map((s) => ({ ...s, projectName: r.value.projectName })),
        )
        .sort((a, b) => a.id - b.id);

      const activeCount = activeSprints.filter(
        (r): r is PromiseFulfilledResult<SprintResponse | null> =>
          r.status === "fulfilled" && !!r.value,
      ).length;

      setStories(assignedStories.slice(0, 8));
      setActiveSprintsCount(activeCount);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const inProgress = stories.filter((s) => s.statut === "EN_COURS").length;
  const done = stories.filter((s) => s.statut === "TERMINE").length;
  const active = stories.filter((s) => s.statut !== "TERMINE").length;

  const statItems: StatItem[] = [
    {
      label: "Tâches actives",
      value: String(active),
      icon: "checkmark-done",
      tone: COLORS.primary,
    },
    {
      label: "En cours",
      value: String(inProgress),
      icon: "refresh-circle",
      tone: "#f59e0b",
    },
    {
      label: "Terminées",
      value: String(done),
      icon: "settings",
      tone: "#22c55e",
    },
    {
      label: "Sprints actifs",
      value: String(activeSprintsCount),
      icon: "calendar",
      tone: "#38bdf8",
    },
  ];

  return (
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
            load();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <HeroCard
        eyebrow="Développeur"
        title="Developer Dashboard"
        subtitle="Suivi de vos tâches assignées, progression et couverture des sprints."
      />
      {loading ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{ marginVertical: SIZES.xl }}
        />
      ) : (
        <View style={styles.grid}>
          {statItems.map((item) => (
            <StatCard key={item.label} item={item} />
          ))}
        </View>
      )}
      <SectionCard title="My Assigned Tasks">
        {stories.length === 0 ? (
          <EmptyState message="Aucune story assignée" />
        ) : (
          stories.map((s) => (
            <View key={s.id} style={styles.storyRow}>
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle}>{s.titre}</Text>
                <Text style={styles.storyDetail}>
                  {s.statut.replace("_", " ")} · {s.projectName ?? "Projet"}
                  {s.points !== undefined ? ` · ${s.points} pts` : ""}
                </Text>
              </View>
              <StatusBadge
                label={s.statut.replace("_", " ")}
                color={
                  s.statut === "EN_COURS"
                    ? "#f59e0b"
                    : s.statut === "TERMINE"
                      ? "#22c55e"
                      : s.statut === "A_TESTER"
                        ? "#06b6d4"
                        : "#9ca3af"
                }
              />
            </View>
          ))
        )}
      </SectionCard>
    </ScrollView>
  );
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  return (
    <View style={styles.root}>
      {role === "Super Admin" && <SuperAdminDashboard />}
      {role === "Product Owner" && <ProductOwnerDashboard />}
      {role === "Scrum Master" && <ScrumMasterDashboard />}
      {role === "Testeur QA" && <QATesterDashboard />}
      {role === "Développeur" && <DeveloperDashboard />}
      {!role && <SuperAdminDashboard />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  heroCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  heroEyebrow: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
    marginBottom: SIZES.sm,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: SIZES.font2xl,
    fontWeight: "800",
    marginBottom: SIZES.sm,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    lineHeight: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: SIZES.radiusRound,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md,
  },
  statValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: "800" },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    marginBottom: SIZES.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    textAlign: "center",
    paddingVertical: SIZES.md,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.md,
  },
  activityContent: { flex: 1 },
  activityTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  activityDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  activityTime: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  activityMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  activityMetricLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  activityMetricValue: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  projectInfo: { flex: 1 },
  projectName: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  projectDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },

  sprintCard: { padding: SIZES.sm },
  sprintName: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
    marginBottom: SIZES.sm,
  },
  sprintObjectif: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.sm,
  },
  sprintMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sprintDate: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  storyInfo: { flex: 1 },
  storyTitle: { color: COLORS.text, fontSize: SIZES.fontSm, fontWeight: "600" },
  storyDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  badgeText: { fontSize: SIZES.fontXs, fontWeight: "700" },
});
