// Social Login Helpers
// This file shows how to implement Google and GitHub OAuth integration

import { useAuth } from "@/features/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback } from "react";

// Ensure the app is registered for URL schemes
WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = () => {
  const { loginWithGoogle } = useAuth();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
    // Add other config as needed
  });

  const handleGoogleLogin = useCallback(async () => {
    try {
      const result = await promptAsync();

      if (result?.type === "success") {
        // Get the ID token from response
        const { id_token } = result.params;

        // Send to your backend or call loginWithGoogle
        await loginWithGoogle(id_token);
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }, [promptAsync, loginWithGoogle]);

  return {
    handleGoogleLogin,
    isLoading: !request,
  };
};

export const useGitHubLogin = () => {
  const { loginWithGitHub } = useAuth();

  const handleGitHubLogin = useCallback(async () => {
    try {
      // GitHub OAuth is more complex - requires your own OAuth app
      // You'll need to:
      // 1. Create GitHub OAuth App (settings.github.com/apps)
      // 2. Implement auth flow in your backend
      // 3. Or use a service like Expo's auth session with GitHub provider

      // Example implementation:
      const githubToken = await getGitHubToken(); // Your implementation
      await loginWithGitHub(githubToken);
    } catch (error) {
      console.error("GitHub login error:", error);
      throw error;
    }
  }, [loginWithGitHub]);

  return {
    handleGitHubLogin,
  };
};

// Placeholder function - implement based on your auth flow
async function getGitHubToken(): Promise<string> {
  // Implement GitHub OAuth flow
  // https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app
  throw new Error("Implement GitHub OAuth flow");
}

// Usage example in a component:
/*
import { useGoogleLogin } from '@/lib/socialLogins';

export function LoginScreen() {
  const { handleGoogleLogin, isLoading } = useGoogleLogin();

  return (
    <SocialButton 
      provider="google" 
      onPress={handleGoogleLogin}
      loading={isLoading}
    />
  );
}
*/
