import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { projectsService } from "@/services/projects";
import { reportsService } from "@/services/reports";
import { cahierTestsService } from "@/services/tests";
import type { ProjetResponse } from "@/types/api";
import { dashboardStyles as styles } from "@/components/dashboardStyles";
import { StatItem, asArray } from "@/utils/DashboardUtils";
import {
  HeroCard,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
} from "@/components/DashboardSharedComponents";

export default function QATesterDashboard() {
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
      const safeProjects = data ?? [];
      setProjects(safeProjects);

      const details = await Promise.allSettled(
        safeProjects.map(async (project) => {
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
    } catch {
      setProjects([]);
      setQaStats({
        cahiers: 0,
        rapports: 0,
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
        eyebrow="QA Tester"
        title="Quality Dashboard"
        subtitle="Run tests, capture results, and generate QA reports."
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
          <EmptyState message="No assigned projects" />
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
