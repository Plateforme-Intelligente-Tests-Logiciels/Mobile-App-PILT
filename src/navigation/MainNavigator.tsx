import React from "react";
import { useAuthStore } from "@/context/authStore";
import { DeveloperTabs } from "./DeveloperTabs";
import { ProductOwnerTabs } from "./ProductOwnerTabs";
import { QATabs } from "./QATabs";
import { ScrumMasterTabs } from "./ScrumMasterTabs";
import { SuperAdminTabs } from "./SuperAdminTabs";

export const MainNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  switch (role) {
    case "Super Admin":
      return <SuperAdminTabs />;
    case "Product Owner":
      return <ProductOwnerTabs />;
    case "Testeur QA":
      return <QATabs />;
    case "Scrum Master":
      return <ScrumMasterTabs />;
    case "Développeur":
    default:
      return <DeveloperTabs />;
  }
};
