# Authentication System - Usage Examples

## Complete Login Screen Example

```typescript
import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/features/auth';
import { Button, TextInputField, Checkbox, SocialButton, Card } from '@/components/ui';
import { COLORS, SIZES } from '@/constants';

export function LoginExample() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = useCallback(async () => {
    try {
      clearError();
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login error:', err);
    }
  }, [email, password, login, clearError, router]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: SIZES.lg, paddingVertical: SIZES.xl }}>

        {error && (
          <Card style={{ marginBottom: SIZES.lg }}>
            <Text style={{ color: COLORS.error }}>{error}</Text>
          </Card>
        )}

        <TextInputField
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon="mail-outline"
        />

        <TextInputField
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Checkbox
          value={rememberMe}
          onPress={() => setRememberMe(!rememberMe)}
          label="Remember me"
        />

        <Button
          label="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          disabled={!email || !password}
          size="lg"
        />

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={{ marginTop: SIZES.lg }}>
            <Text style={{ color: COLORS.primary, textAlign: 'center' }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </Link>

      </View>
    </ScrollView>
  );
}
```

## Complete Registration Example

```typescript
import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth';
import { Button, TextInputField, RadioButton } from '@/components/ui';
import { COLORS, SIZES } from '@/constants';
import { USER_ROLES } from '@/constants/roles';
import { UserRole } from '@/types/auth';

export function RegisterExample() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Développeur');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(fullName, email, phone, role, password);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: SIZES.lg, paddingVertical: SIZES.xl }}>

        <TextInputField
          label="Full Name"
          placeholder="John Doe"
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
        />

        <TextInputField
          label="Email"
          placeholder="john@company.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon="mail-outline"
        />

        <TextInputField
          label="Phone"
          placeholder="+1234567890"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Text style={{ color: COLORS.text, marginBottom: SIZES.md }}>
          Select Your Role
        </Text>

        {USER_ROLES.map((r) => (
          <RadioButton
            key={r.label}
            label={r.label}
            value={r.label}
            selected={role === r.label}
            onPress={() => setRole(r.label as UserRole)}
            icon={r.icon}
          />
        ))}

        <TextInputField
          label="Password"
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="lock-closed-outline"
        />

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          size="lg"
          style={{ marginTop: SIZES.lg }}
        />

      </View>
    </ScrollView>
  );
}
```

## Using Custom Hooks

```typescript
import { useAuth, useUser, useIsAuthenticated, useAuthToken } from '@/features/auth';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export function AuthStatusExample() {
  const auth = useAuth();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const token = useAuthToken();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User logged in:', user);
      console.log('Token:', token);
    }
  }, [isAuthenticated, user, token]);

  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Text>Role: {user?.role}</Text>
      <Text>Auth Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}</Text>
    </View>
  );
}
```

## Protected Route Implementation

```typescript
import { useIsAuthenticated } from "@/features/auth";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export function RootLayoutNavigation() {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments]);
}
```

## Form Validation Example

```typescript
import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { Button, TextInputField } from '@/components/ui';
import { COLORS, SIZES } from '@/constants';

export function ValidatedFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form is valid, submit...');
    }
  };

  return (
    <View style={{ paddingHorizontal: SIZES.lg }}>
      <TextInputField
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        icon="mail-outline"
      />

      <TextInputField
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        icon="lock-closed-outline"
      />

      <Button
        label="Submit"
        onPress={handleSubmit}
        disabled={!email || !password}
        size="lg"
      />
    </View>
  );
}
```

## Error Handling Example

```typescript
import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuth } from '@/features/auth';
import { COLORS } from '@/constants';

export function ErrorHandlingExample() {
  const { error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      // Show error alert
      Alert.alert('Error', error, [
        {
          text: 'OK',
          onPress: () => clearError(),
        },
      ]);
    }
  }, [error, clearError]);

  return (
    <View>
      {error && (
        <View style={{
          backgroundColor: COLORS.error,
          padding: 12,
          borderRadius: 8
        }}>
          <Text style={{ color: COLORS.white }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}
```

## Social Login Implementation

```typescript
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '@/features/auth';
import { SocialButton } from '@/components/ui';
import { SIZES } from '@/constants';

export function SocialLoginExample() {
  const { loginWithGoogle, loginWithGitHub, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // Get Google token from OAuth flow
      const googleToken = 'google-token-from-oauth-flow';
      await loginWithGoogle(googleToken);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      // Get GitHub token from OAuth flow
      const githubToken = 'github-token-from-oauth-flow';
      await loginWithGitHub(githubToken);
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  return (
    <View style={{ flexDirection: 'row', gap: SIZES.md, justifyContent: 'center' }}>
      <SocialButton
        provider="google"
        onPress={handleGoogleLogin}
        loading={isLoading}
      />
      <SocialButton
        provider="github"
        onPress={handleGitHubLogin}
        loading={isLoading}
      />
    </View>
  );
}
```

## Logout Example

```typescript
import React from 'react';
import { View, Alert } from 'react-native';
import { useAuth } from '@/features/auth';
import { Button } from '@/components/ui';
import { useRouter } from 'expo-router';

export function LogoutExample() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View>
      <Button
        label="Logout"
        onPress={handleLogout}
        variant="danger"
      />
    </View>
  );
}
```
