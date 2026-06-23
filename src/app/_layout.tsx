import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/store/auth-store';
import { ProgressProvider } from '@/store/progress-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ProgressProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="lesson/[id]" options={{ title: 'Lección' }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="results" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
