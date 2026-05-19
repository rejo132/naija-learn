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
import { useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { initialiseSentry } from '@/lib/sentry';
import { loadUserProgress } from '@/services/dbService';
import { supabase } from '@/lib/supabase';
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
  const router = useRouter();
  const segments = useSegments();
  const session = useAuthStore((s) => s.session);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isInitialising, setIsInitialising] = useState(true);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    useAppStore.persist.rehydrate();
    async function init() {
      await useAuthStore.getState().initialise();

      try {
        const saved = await loadUserProgress();
        if (saved) {
          const store = useAppStore.getState();

          if (saved.totalXP > (store.xp ?? 0)) {
            store.setXP(saved.totalXP);
          }

          if (saved.streak > (store.streak ?? 0)) {
            store.setStreak(saved.streak);
          }

          if (saved.grade && !store.selectedGrade) {
            store.setGrade(saved.grade);
          }

          if (saved.language && !store.selectedLanguage) {
            store.setLanguage(saved.language as 'en' | 'ha' | 'yo' | 'ig');
          }

          if (Object.keys(saved.subjectProgress).length > 0) {
            const merged = {
              ...saved.subjectProgress,
              ...(store.subjectProgress ?? {}),
            };
            store.setSubjectProgress(merged);
          }
        }
      } catch (err) {
        console.error('Progress restore error:', err);
      }

      setIsInitialising(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (isInitialising) return;
    const timer = setTimeout(() => setIsLayoutReady(true), 0);
    return () => clearTimeout(timer);
  }, [isInitialising]);

  useEffect(() => {
    if (!isLayoutReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/dashboard');
    }
  }, [session, segments, isLayoutReady, router]);

  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle OAuth redirect callback on web. The provider redirects back to the
  // app with the access token in the URL hash; we exchange it for a session
  // and then clean the URL so the token is not left visible.
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          useAuthStore.getState().setSession(session);
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    }
  }, []);

  if (!fontsLoaded) return null;

  if (isInitialising) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#008751',
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎓</Text>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 28,
            fontFamily: 'Poppins-Bold',
          }}
        >
          Learnova
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontFamily: 'Poppins-Regular',
            marginTop: 8,
          }}
        >
          AI-Powered Learning
        </Text>
      </View>
    );
  }

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
                <Stack.Screen name="progress" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="children" />
                <Stack.Screen name="child-select" />
                <Stack.Screen name="parent-dashboard" />
                <Stack.Screen name="personality" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="auth" />
              </Stack>
              <BottomTabBar />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Sentry.ErrorBoundary>
  );
}