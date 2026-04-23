import { COLORS, SIZES } from "@/constants";
import { useAuthStore } from "@/features/auth/store";
import { UserRole } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabMeta {
  label: string;
  icon: TabIconName;
}

const ALL_TABS: Record<string, TabMeta> = {
  index: { label: "Dashboard", icon: "grid-outline" },
  users: { label: "Utilisateurs", icon: "people-outline" },
  roles: { label: "Rôles", icon: "shield-checkmark-outline" },
  logs: { label: "Logs", icon: "receipt-outline" },
  projects: { label: "Projets", icon: "folder-outline" },
  backlog: { label: "Backlog", icon: "list-outline" },
  sprints: { label: "Sprints", icon: "flash-outline" },
  team: { label: "Équipe", icon: "people-circle-outline" },
  tests: { label: "Cahier", icon: "checkmark-circle-outline" },
  reports: { label: "Rapports QA", icon: "bar-chart-outline" },
  stories: { label: "User Stories", icon: "document-text-outline" },
  profile: { label: "Profil", icon: "person-circle-outline" },
};

const ROLE_TABS: Record<UserRole, string[]> = {
  "Super Admin": ["index", "users", "roles", "logs", "profile"],
  "Product Owner": ["index", "projects", "backlog", "reports", "profile"],
  "Scrum Master": ["index", "sprints", "backlog", "team", "profile"],
  "Testeur QA": ["index", "sprints", "tests", "reports", "profile"],
  Développeur: ["index", "sprints", "stories", "reports", "tests", "profile"],
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const meta = ALL_TABS[name];
  if (!meta) return null;
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Ionicons
        name={meta.icon}
        size={20}
        color={focused ? COLORS.white : COLORS.textSecondary}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {meta.label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const role = user.role as UserRole;
  const visibleTabs = ROLE_TABS[role] ?? ROLE_TABS["Développeur"];

  const allScreenNames = Object.keys(ALL_TABS);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {allScreenNames.map((name) => {
        const isVisible = visibleTabs.includes(name);
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: ALL_TABS[name]?.label ?? name,
              href: isVisible ? undefined : null,
              tabBarIcon: ({ focused }) => (
                <TabIcon name={name} focused={focused} />
              ),
            }}
          />
        );
      })}
      {/* Hide the legacy explore tab */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: SIZES.lg,
    right: SIZES.lg,
    bottom: SIZES.lg,
    height: Platform.OS === "ios" ? 78 : 72,
    backgroundColor: COLORS.backgroundSecondary,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radiusXl,
    paddingHorizontal: SIZES.sm,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    minWidth: 58,
    height: 54,
    borderRadius: SIZES.radiusLg,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.white,
  },
});
