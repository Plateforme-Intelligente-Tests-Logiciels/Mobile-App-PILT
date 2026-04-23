import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: {
          backgroundColor: "#0F1319",
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name="select-role"
        options={{
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          animationTypeForReplace: "push",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
