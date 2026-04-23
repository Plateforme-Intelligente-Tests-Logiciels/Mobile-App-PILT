import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { COLORS, SIZES } from "@/constants";

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_META: Record<string, { label: string; icon: TabIconName }> = {
  index: { label: "Dashboard", icon: "grid-outline" },
  users: { label: "Users", icon: "people-outline" },
  roles: { label: "Roles", icon: "shield-checkmark-outline" },
  logs: { label: "Logs", icon: "receipt-outline" },
  profile: { label: "Profile", icon: "person-circle-outline" },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Super Admin",
          tabBarIcon: ({ focused }) => {
            const item = TAB_META.index;
            return (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Utilisateurs",
          tabBarIcon: ({ focused }) => {
            const item = TAB_META.users;
            return (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="roles"
        options={{
          title: "Roles",
          tabBarIcon: ({ focused }) => {
            const item = TAB_META.roles;
            return (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ focused }) => {
            const item = TAB_META.logs;
            return (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused }) => {
            const item = TAB_META.profile;
            return (
              <View style={[styles.tabItem, focused && styles.tabItemActive]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelActive]}
                >
                  {item.label}
                </Text>
              </View>
            );
          },
        }}
      />
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
    minWidth: 62,
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
    fontSize: SIZES.fontXs,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: COLORS.white,
  },
});
