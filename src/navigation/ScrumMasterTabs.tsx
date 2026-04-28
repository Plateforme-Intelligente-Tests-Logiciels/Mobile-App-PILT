import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ScrumMasterTabParamList } from "./types";
import { InstagramTabBar } from "./InstagramTabBar";
import ScrumMasterDashboard from "@/screens/ScrumMasterDashboard";
import SprintsScreen from "@/screens/SprintsScreen";
import BacklogScreen from "@/screens/BacklogScreen";
import TeamScreen from "@/screens/TeamScreen";
import ProfileScreen from "@/screens/ProfileScreen";

const Tab = createBottomTabNavigator<ScrumMasterTabParamList>();

export const ScrumMasterTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <InstagramTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={ScrumMasterDashboard} />
      <Tab.Screen name="Sprints" component={SprintsScreen} />
      <Tab.Screen name="Backlog" component={BacklogScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
