# Setup Guide - Mobile App Authentication

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Install Additional Packages

After running the install command, you may need to install AsyncStorage explicitly:

```bash
npx expo install @react-native-async-storage/async-storage
```

### 3. Environment Setup

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the values:

```
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### 4. Start the Dev Server

```bash
npm start
# or
npm run web      # for web
npm run ios      # for iOS
npm run android  # for Android
```

## Architecture Overview

### User Flow

```
Start App
  ↓
Check Authentication Status (useIsAuthenticated)
  ├─ If Authenticated → Navigate to (tabs)
  └─ If Not Authenticated → Navigate to (auth)
    ├─ login (email/password)
    ├─ register (create account)
    ├─ forgot-password (reset password)
    └─ select-role (OAuth role selection)
```

### Authentication State Management

The authentication state is managed using Zustand and persisted with AsyncStorage:

```
User logs in/registers
  ↓
API call to backend
  ↓
Store token + user data in Zustand store
  ↓
Persist to AsyncStorage
  ↓
useIsAuthenticated() returns true
  ↓
Router shows (tabs) instead of (auth)
```

## Key Configuration Files

### babel.config.js

- Configures module resolution for `@/*` imports
- Enables NativeWind support
- Enables Reanimated plugin

### tsconfig.json

- Sets up path aliases: `@/*` → `./src/*`
- Enables strict TypeScript checking

### app/\_layout.tsx

- Root navigation layout
- Conditional routing based on authentication state
- Gesture handler setup

### src/features/auth/api.ts

- All authentication API calls
- Axios instance configuration
- Token management

### src/features/auth/store.ts

- Zustand authentication store
- Persistent state with AsyncStorage
- All auth actions and state

## Testing the Authentication Flow

### Test Login

1. Start the app
2. You should see the login screen
3. Enter test credentials
4. Mock API will respond with success
5. App navigates to (tabs)

### Test Registration

1. From login, click "Sign up"
2. Fill all fields
3. Select a role
4. Submit registration
5. App navigates to (tabs)

### Test Forgot Password

1. From login, click "Forgot password?"
2. Enter email
3. You'll see success confirmation

## API Integration

### Configure Your Backend

Update the base URL in `src/features/auth/api.ts`:

```typescript
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.agile-platform.com";
```

### Expected Backend Endpoints

```
POST /auth/login
  Request: { email, password }
  Response: { user, token, refreshToken }

POST /auth/register
  Request: { fullName, email, phoneNumber, role, password }
  Response: { user, token, refreshToken }

POST /auth/forgot-password
  Request: { email }
  Response: { message }

POST /auth/reset-password
  Request: { token, newPassword }
  Response: { message }

POST /auth/refresh
  Request: { refreshToken }
  Response: { user, token, refreshToken }
```

## Component Usage Examples

### Using the Auth Hook

```typescript
import { useAuth } from '@/features/auth';

export function MyComponent() {
  const { user, isLoading, error, login, logout } = useAuth();

  return (
    <View>
      {user && <Text>Welcome, {user.fullName}</Text>}
      <Button label="Logout" onPress={logout} />
    </View>
  );
}
```

### Using Individual Hooks

```typescript
import { useUser, useIsAuthenticated, useAuthToken } from '@/features/auth';

export function StatusComponent() {
  const user = useUser();
  const isAuth = useIsAuthenticated();
  const token = useAuthToken();

  return (
    <View>
      <Text>User: {user?.fullName}</Text>
      <Text>Auth: {isAuth ? 'Yes' : 'No'}</Text>
      <Text>Token: {token ? 'Present' : 'Missing'}</Text>
    </View>
  );
}
```

### Using Components

```typescript
import {
  Button,
  TextInputField,
  RadioButton,
  Card
} from '@/components/ui';

export function FormComponent() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Développeur');

  return (
    <Card>
      <TextInputField
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        icon="mail-outline"
      />

      <RadioButton
        label="Developer"
        selected={role === 'Développeur'}
        onPress={() => setRole('Développeur')}
      />

      <Button
        label="Submit"
        onPress={() => console.log(email, role)}
      />
    </Card>
  );
}
```

## Styling

### Using Colors

```typescript
import { COLORS, SIZES } from "@/constants";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  text: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
  },
});
```

### Using NativeWind (Tailwind)

Components already have inline styles, but you can add NativeWind classes:

```typescript
import { Text } from 'react-native';

export function StyledText() {
  return <Text className="text-white text-base font-semibold">Hello</Text>;
}
```

## Animations

### Using Built-in Animations

```typescript
import { useFadeInAnimation } from '@/lib/animations';

export function AnimatedComponent() {
  const animatedStyle = useFadeInAnimation(isVisible);

  return (
    <Animated.View style={animatedStyle}>
      <Text>Fading content</Text>
    </Animated.View>
  );
}
```

## Debugging

### Check Auth State

```typescript
import { useAuthStore } from "@/features/auth/store";

export function DebugAuth() {
  const state = useAuthStore();

  useEffect(() => {
    console.log("Auth State:", state);
  }, [state]);

  return null;
}
```

### Monitor API Calls

Add logging to `src/features/auth/api.ts`:

```typescript
const response = await this.axiosInstance.post(url, data);
console.log("API Response:", response.data);
```

## Common Issues

### AsyncStorage Not Persisting

- Make sure `@react-native-async-storage/async-storage` is installed
- Check that the app is not running in a sandboxed environment

### Auth State Lost on Reload

- The store is configured with AsyncStorage persistence
- Check browser/device storage settings

### API Errors

- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check backend is running and accessible
- Look at network tab in dev tools

## Next Steps

1. **Connect to Real Backend**
   - Update API endpoints in `src/features/auth/api.ts`
   - Configure CORS if needed

2. **Implement Social Login**
   - Use `src/lib/socialLogins.ts` as reference
   - Set up Google OAuth and GitHub OAuth apps
   - Update environment variables

3. **Add Biometric Auth**
   - Install expo-local-authentication
   - Implement in login flow

4. **Add Analytics**
   - Track login/register events
   - Monitor authentication errors

5. **Enhance UI**
   - Add custom animations
   - Implement dark mode toggle
   - Add accessibility features

## Resources

- [Expo Router Documentation](https://expo.dev/routing)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [NativeWind Documentation](https://www.nativewind.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
