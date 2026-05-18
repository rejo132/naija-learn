import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { COLORS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

interface NavItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', emoji: '🏠', route: '/', section: 'main' },
  { id: 'learn', label: 'Learn', emoji: '📚', route: '/dashboard', section: 'main' },
  { id: 'progress', label: 'My Progress', emoji: '📈', route: '/progress', section: 'main' },
  { id: 'achievements', label: 'Achievements', emoji: '🏆', route: '/achievements', section: 'main' },
  { id: 'personality', label: 'My Tutor', emoji: '👩🏽‍🏫', route: '/personality', section: 'settings' },
  { id: 'children', label: 'Children', emoji: '👨‍👩‍👧', route: '/children', section: 'settings' },
  { id: 'reports', label: 'Reports', emoji: '📊', route: '/parent-dashboard', section: 'settings' },
];

function NavButton({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.route ||
    (item.route !== '/' && pathname.startsWith(item.route));

  return (
    <TouchableOpacity
      style={[styles.navItem, isActive && styles.navItemActive]}
      onPress={() => router.push(item.route as '/')}
    >
      <Text style={styles.navEmoji}>{item.emoji}</Text>
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {item.label}
      </Text>
      {isActive && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

export function SideDrawer() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { signOut, user } = useAuthStore();
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);

  if (width <= 768) return null;
  if (pathname.startsWith('/auth')) return null;

  const mainItems = NAV_ITEMS.filter((i) => i.section === 'main');
  const settingsItems = NAV_ITEMS.filter((i) => i.section === 'settings');

  return (
    <View style={styles.drawer}>
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
        <View>
          <Text style={styles.logoName}>Learnova</Text>
          <Text style={styles.logoTagline}>AI Learning</Text>
        </View>
      </View>

      {user && (
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>⚡{xp} XP</Text>
          </View>
          <View style={[styles.statBadge, styles.streakBadge]}>
            <Text style={[styles.statBadgeText, styles.streakBadgeText]}>🔥{streak}</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionLabel}>MAIN</Text>
      {mainItems.map((item) => (
        <NavButton key={item.id} item={item} pathname={pathname} />
      ))}

      <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>SETTINGS</Text>
      {settingsItems.map((item) => (
        <NavButton key={item.id} item={item} pathname={pathname} />
      ))}

      <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
        <Text style={styles.signOutEmoji}>🚪</Text>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: 240,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,135,81,0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    ...SHADOWS.soft,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,135,81,0.1)',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  logoName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  logoTagline: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  streakBadge: {
    backgroundColor: '#fee2e2',
  },
  statBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.accentDark,
  },
  streakBadgeText: {
    color: '#DC2626',
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  navEmoji: { fontSize: 18 },
  navLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
  },
  navLabelActive: {
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.2)',
  },
  signOutEmoji: { fontSize: 18 },
  signOutText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#E53935',
  },
});
