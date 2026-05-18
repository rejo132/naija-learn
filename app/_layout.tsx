/**
 * Root application layout for Expo Router.
 *
 * @remarks
 * **Responsible for:** Wrapping every screen with gesture handling and safe-area
 * context; keeping the native splash visible briefly; registering the file-based
 * stack (`index`, `grade`, `dashboard`, `lesson`) with headers hidden.
 *
 * **Talks to:**
 * - Imports: `expo-router` (`Stack`), `expo-status-bar`, `expo-splash-screen`,
 *   `react-native-gesture-handler`, `react-native-safe-area-context`,
 *   `@/constants/theme` (`COLORS`).
 * - Consumed by: Expo Router automatically — this file is the app shell; no other
 *   file imports it directly.
 * - Exports: default `RootLayout` (required Expo Router root layout).
 *
 * **Notes for new developers:**
 * - Screen file names under `app/` map 1:1 to routes; new screens need a
 *   `<Stack.Screen name="..." />` entry here.
 * - Splash hides after a fixed 500ms timer, not when fonts/assets finish loading.
 * - All screens use `headerShown: false` and implement their own back UI.
 */
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { initialiseSentry } from '@/lib/sentry';
import { OfflineBanner } from '@/components/OfflineBanner';
import { BottomTabBar } from '@/components/BottomTabBar';
import { SideDrawer } from '@/components/SideDrawer';

SplashScreen.preventAutoHideAsync();
initialiseSentry();

function ErrorFallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 48 }}>😔</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center' }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 8, textAlign: 'center' }}>
        Please close and reopen Learnova
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar
            style={isDarkMode ? 'light' : 'dark'}
            backgroundColor={isDarkMode ? '#0F1512' : COLORS.background}
          />
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <SideDrawer />
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="grade" />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="lesson" />
                <Stack.Screen name="auth/sign-in" />
                <Stack.Screen name="auth/sign-up" />
                <Stack.Screen name="children" />
                <Stack.Screen name="parent-dashboard" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="progress" />
                <Stack.Screen name="personality" />
              </Stack>
              <BottomTabBar />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Sentry.ErrorBoundary>
  );
}