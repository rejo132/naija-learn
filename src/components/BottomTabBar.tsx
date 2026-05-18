import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_SIZES, RADIUS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { ParentGate } from '@/components/ParentGate';

interface TabItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
  requiresGrade?: boolean;
  requiresParentGate?: boolean;
}

export function BottomTabBar() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const selectedGrade = useAppStore((s) => s.selectedGrade);
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [gateVisible, setGateVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState('');

  const BASE_TABS: TabItem[] = [
    { id: 'home', label: t('home'), emoji: '🏠', route: '/dashboard' },
    { id: 'learn', label: t('learn'), emoji: '📚', route: '/dashboard', requiresGrade: true },
    { id: 'progress', label: t('progress'), emoji: '📈', route: '/progress' },
    { id: 'achievements', label: t('achievements'), emoji: '🏆', route: '/achievements' },
    {
      id: 'profile',
      label: `${t('children')} 🔐`,
      emoji: '👤',
      route: '/children',
      requiresParentGate: true,
    },
    { id: 'theme', label: 'Theme', emoji: '🌙', route: '' },
  ];

  const hideOn = ['/auth/sign-in', '/auth/sign-up', '/lesson', '/personality'];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  if (width > 768) return null;

  function navigateTo(route: string) {
    router.push(route as '/');
  }

  function isActive(route: string): boolean {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(route);
  }

  function handleTabPress(tab: TabItem) {
    if (tab.id === 'theme') {
      useAppStore.getState().toggleDarkMode();
      return;
    }
    if (tab.requiresGrade && !selectedGrade) {
      router.push('/grade');
      return;
    }
    if (tab.requiresParentGate) {
      setPendingRoute(tab.route);
      setGateVisible(true);
      return;
    }
    if (tab.route === '/dashboard') {
      router.replace('/dashboard');
      return;
    }
    navigateTo(tab.route);
  }

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingBottom: insets.bottom + 4,
            backgroundColor: isDarkMode ? colors.backgroundCard : '#FFFFFF',
            borderTopColor: colors.border,
          },
        ]}
      >
        {BASE_TABS.map((tab) => {
          const emoji = tab.id === 'theme' ? (isDarkMode ? '☀️' : '🌙') : tab.emoji;
          const active =
            tab.id !== 'theme' && tab.route !== '' && isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleTabPress(tab)}
            >
              <View
                style={[
                  styles.tabIconWrap,
                  active && { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={styles.tabEmoji}>{emoji}</Text>
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: colors.textMuted },
                  active && { color: colors.primary, fontFamily: 'Poppins-SemiBold' },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ParentGate
        visible={gateVisible}
        onSuccess={() => {
          setGateVisible(false);
          if (pendingRoute) {
            navigateTo(pendingRoute);
          }
          setPendingRoute('');
        }}
        onCancel={() => {
          setGateVisible(false);
          setPendingRoute('');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  tabActive: {},
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
  },
});
