import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SIZES } from "@/constants";
import { logsService } from "@/services/logs";
import { rolesService, usersService } from "@/services/users";
import { dashboardStyles as styles } from "@/components/dashboardStyles";
import {
  StatItem,
  asArray,
  normalizeDashboardActivity,
} from "@/utils/DashboardUtils";
import {
  HeroCard,
  SectionCard,
  StatCard,
  EmptyState,
  NotificationBell,
} from "@/components/DashboardSharedComponents";
import type { DashboardActivity } from "@/types/api";
import { useNotificationRealtime } from "@/hooks/use-notification-realtime";
import { NotificationsModal } from "@/components/NotificationsModal";

export default function SuperAdminDashboard() {
  const insets = useSafeAreaInsets();
  const { enabled, unreadCount } = useNotificationRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SIZES.lg,
        }}
      >
        <View>
          <Text style={{ color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: "800" }}>
            Super Admin
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: SIZES.fontSm }}>
            Dashboard
          </Text>
        </View>
        <NotificationBell
          enabled={enabled}
          unreadCount={unreadCount}
          onPress={() =>
            enabled
              ? setShowNotifications(true)
              : Alert.alert("Notifications", "Notifications desactivees")
          }
        />
      </View>
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
          <EmptyState message="No recent activity" />
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
          <EmptyState message="No activity data available" />
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
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ScrollView>
  );
}
