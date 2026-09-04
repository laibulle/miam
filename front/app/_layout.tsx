import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { colors, fontsToLoad } from '@/components/ui/tokens';
import { useAuthStore } from '@/features/auth/useAuthStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontsToLoad);
  const authenticated = useAuthStore((state) => state.authenticated);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Protected guard={!authenticated}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={authenticated}>
          <Stack.Screen name="profile" />
          <Stack.Screen name="home" />
          <Stack.Screen name="recipe" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
