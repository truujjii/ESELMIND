import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SignInScreen } from '@/components/sign-in-screen';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/store/auth-store';
import { ProgressProvider } from '@/store/progress-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProgressProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </ThemeProvider>
        </ProgressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Auth gate: with no session the only screen is sign-in. The session is restored
// from AsyncStorage on launch, so after the first login the app opens straight
// through — including offline.
function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) return <SplashLoading />;
  if (!session) return <SignInScreen />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="lesson/[id]" options={{ title: 'Lección' }} />
      <Stack.Screen name="quiz/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
    </Stack>
  );
}

function SplashLoading() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}
