import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_SIZES, RADIUS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface TabItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
  requiresGrade?: boolean;
}

export function BottomTabBar() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const selectedGrade = useAppStore((s) => s.selectedGrade);
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const TABS: TabItem[] = [
    { id: 'home', label: t('home'), emoji: '🏠', route: '/dashboard' },
    { id: 'learn', label: t('learn'), emoji: '📚', route: '/dashboard', requiresGrade: true },
    { id: 'progress', label: t('progress'), emoji: '📈', route: '/progress' },
    { id: 'achievements', label: t('achievements'), emoji: '🏆', route: '/achievements' },
    { id: 'settings', label: t('settingsTitle'), emoji: '⚙️', route: '/settings' },
  ];

  const hideOn = ['/auth/sign-in', '/auth/sign-up', '/lesson', '/personality'];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  if (width > 768) return null;

  function goDashboard() {
    if (router.canGoBack()) {
      router.dismissAll();
    }
    router.replace('/dashboard');
  }

  function isActive(route: string): boolean {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/' || pathname === '';
    }
    return pathname === route;
  }

  function handleTabPress(tab: TabItem) {
    if (tab.requiresGrade && !selectedGrade) {
      router.push('/grade');
      return;
    }
    if (tab.route === '/dashboard') {
      goDashboard();
      return;
    }
    router.push(tab.route as '/');
  }

  return (
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
      {TABS.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, active && styles.tabActive]}
            activeOpacity={0.75}
            onPress={() => handleTabPress(tab)}
          >
            <View
              style={[
                styles.tabIconWrap,
                active && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textMuted, fontSize: 11 },
                active && { color: colors.primary, fontFamily: 'Poppins-SemiBold' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
    paddingVertical: 8,
    minHeight: 56,
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
