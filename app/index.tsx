import { useAuthStore } from "@/features/auth/store";
import { Redirect } from "expo-router";

export default function IndexPage() {
  const { user } = useAuthStore();
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
