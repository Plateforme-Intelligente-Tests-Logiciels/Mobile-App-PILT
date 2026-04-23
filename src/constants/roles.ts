import { UserRole } from "@/types/auth";

export const USER_ROLES: {
  label: UserRole;
  icon: string;
  description: string;
}[] = [
  {
    label: "Super Admin",
    icon: "shield-checkmark",
    description: "Administration complète de la plateforme",
  },
  {
    label: "Développeur",
    icon: "code",
    description: "Développement et implémentation",
  },
  {
    label: "Testeur QA",
    icon: "checkmark-circle",
    description: "Tests et assurance qualité",
  },
  {
    label: "Product Owner",
    icon: "briefcase",
    description: "Gestion de produit",
  },
  {
    label: "Scrum Master",
    icon: "people",
    description: "Facilitation et coordination",
  },
];
