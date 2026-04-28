import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QATabParamList } from "./types";
import { InstagramTabBar } from "./InstagramTabBar";
import QATesterDashboard from "@/screens/QATesterDashboard";
import TestsScreen from "@/screens/TestsScreen";
import ReportsScreen from "@/screens/ReportsScreen";
import SprintsScreen from "@/screens/SprintsScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<QATabParamList>();

export const QATabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={QATesterDashboard} />
      <Tab.Screen name="Tests" component={TestsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
