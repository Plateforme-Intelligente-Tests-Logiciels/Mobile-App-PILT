import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SuperAdminTabParamList } from "./types";
import { InstagramTabBar } from "./InstagramTabBar";
import SuperAdminDashboard from "@/screens/SuperAdminDashboard";
import UsersScreen from "@/screens/UsersScreen";
import RolesScreen from "@/screens/RolesScreen";
import LogsScreen from "@/screens/LogsScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<SuperAdminTabParamList>();

export const SuperAdminTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={SuperAdminDashboard} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Roles" component={RolesScreen} />
      <Tab.Screen name="Logs" component={LogsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
