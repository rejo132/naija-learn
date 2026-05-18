import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';

interface TabItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
  requiresGrade?: boolean;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', emoji: '🏠', route: '/' },
  { id: 'learn', label: 'Learn', emoji: '📚', route: '/dashboard', requiresGrade: true },
  { id: 'progress', label: 'Progress', emoji: '📈', route: '/progress' },
  { id: 'achievements', label: 'Badges', emoji: '🏆', route: '/achievements' },
  { id: 'profile', label: 'Profile', emoji: '👤', route: '/children' },
];

export function BottomTabBar() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const selectedGrade = useAppStore((s) => s.selectedGrade);

  const hideOn = ['/auth/sign-in', '/auth/sign-up', '/lesson', '/personality'];
  if (hideOn.some((p) => pathname.startsWith(p))) return null;

  if (width > 768) return null;

  function handleTabPress(tab: TabItem) {
    if (tab.requiresGrade && !selectedGrade) {
      router.push('/grade');
      return;
    }
    router.push(tab.route as '/');
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 4 }]}>
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route !== '/' && pathname.startsWith(tab.route));
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => handleTabPress(tab)}
          >
            <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,135,81,0.1)',
    paddingTop: 8,
    shadowColor: '#005C36',
    shadowOpacity: 0.1,
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
  tabIconWrapActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'Poppins-Regular',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
});
