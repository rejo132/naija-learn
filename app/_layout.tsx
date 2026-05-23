/**
 * Root application layout for Expo Router.
 */
import { useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { initialiseSentry } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { OfflineBanner } from '@/components/OfflineBanner';
import { BottomTabBar } from '@/components/BottomTabBar';
import { SideDrawer } from '@/components/SideDrawer';
import { loadSounds, unloadSounds } from '@/services/soundService';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/services/notificationService';

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

function parseGradeFromProfile(grade: string | null): {
  userGrade: string;
  selectedGrade: number;
} | null {
  if (!grade?.trim()) return null;
  const gradeStr = String(grade).trim();
  const gradeNum = parseInt(gradeStr.replace(/\D/g, ''), 10) || 0;
  if (gradeNum < 1) return null;
  return {
    userGrade: gradeStr.startsWith('Primary') ? gradeStr : `Primary ${gradeNum}`,
    selectedGrade: gradeNum,
  };
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
    async function init() {
      try {
        await Promise.all([
          useAppStore.persist.rehydrate(),
          useAuthStore.getState().initialise(),
        ]);
      } catch (e) {
        console.error('Init error:', e);
      } finally {
        setIsInitialising(false);
      }
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
    const onSignUp =
      segments[0] === 'auth' && (segments as string[])[1] === 'sign-up';
    const onDashboard = (segments as string[]).includes('dashboard');

    async function route() {
      if (!session && !inAuthGroup) {
        router.replace('/auth/sign-in');
        return;
      }

      if (!session) return;

      const store = useAppStore.getState();
      const userGrade = store.userGrade?.trim();
      const setupComplete = store.setupComplete;

      if (!userGrade && !setupComplete) {
        const profile = await useAuthStore.getState().fetchProfile();

        if (profile?.grade) {
          const parsed = parseGradeFromProfile(profile.grade);
          if (parsed) {
            useAppStore.getState().setUserGrade(parsed.userGrade);
            useAppStore.getState().setUserName(profile.name ?? '');
            useAppStore.getState().setUserAvatar(profile.avatar ?? '🦁');
            useAppStore.getState().setSetupComplete(true);
            useAppStore.setState({
              selectedGrade: parsed.selectedGrade,
            });
          }
          router.replace('/dashboard');
        } else {
          router.replace('/auth/sign-up?step=2');
        }
        return;
      }

      if (userGrade || setupComplete) {
        if (inAuthGroup && !onSignUp) {
          router.replace('/dashboard');
        }
        store.loadUserProgress().catch(() => {});
        if (store.isSignedOut) {
          store.setIsSignedOut(false);
        }
        return;
      }

      if (!onSignUp && !onDashboard) {
        router.replace('/auth/sign-up?step=2');
      }
    }

    route().catch(() => {});
  }, [session, segments, isLayoutReady, router]);

  useEffect(() => {
    if (isInitialising) return;

    const { notificationsEnabled, userName, notificationHour, notificationMinute } =
      useAppStore.getState();

    if (notificationsEnabled) {
      scheduleDailyReminder(
        notificationHour,
        notificationMinute,
        userName || 'there'
      ).catch(() => {});
    } else {
      cancelDailyReminder().catch(() => {});
    }
  }, [isInitialising]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'dashboard') {
        router.push('/dashboard');
      }
    }
    );
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  useEffect(() => {
    if (!isInitialising && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isInitialising, fontsLoaded]);

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
