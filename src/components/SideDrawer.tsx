import { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { COLORS, FONT_SIZES, RADIUS, SPACING, GRADIENTS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

const DRAWER_WIDE = 240;
const DRAWER_COLLAPSED = 64;

interface NavItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
}

const MAIN_NAV: NavItem[] = [
  { id: 'home', label: 'Home', emoji: '🏠', route: '/' },
  { id: 'learn', label: 'Learn', emoji: '📚', route: '/dashboard' },
  { id: 'progress', label: 'My Progress', emoji: '📈', route: '/progress' },
  { id: 'achievements', label: 'Achievements', emoji: '🏆', route: '/achievements' },
];

const SECONDARY_NAV: NavItem[] = [
  { id: 'personality', label: 'My Tutor', emoji: '👩🏽‍🏫', route: '/personality' },
  { id: 'children', label: 'Children', emoji: '👨‍👩‍👧', route: '/children' },
  { id: 'reports', label: 'Reports', emoji: '📊', route: '/parent-dashboard' },
];

function NavButton({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive =
    pathname === item.route ||
    (item.route !== '/' && pathname.startsWith(item.route));

  return (
    <TouchableOpacity
      // @ts-expect-error title is supported on web for hover tooltips
      title={collapsed ? item.label : undefined}
      accessibilityLabel={item.label}
      style={[
        styles.navItem,
        collapsed && styles.navItemCollapsed,
        isActive && !collapsed && styles.navItemActive,
        isActive && collapsed && styles.navItemActiveCollapsed,
      ]}
      onPress={() => router.push(item.route as '/')}
    >
      <Text style={[styles.navEmoji, collapsed && styles.navEmojiCollapsed]}>{item.emoji}</Text>
      {!collapsed && (
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function SideDrawer() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const { signOut } = useAuthStore();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const [collapsed, setCollapsed] = useState(false);
  const animatedWidth = useRef(new Animated.Value(DRAWER_WIDE)).current;

  if (width <= 768) return null;
  if (pathname.startsWith('/auth')) return null;

  function toggleCollapsed() {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    Animated.timing(animatedWidth, {
      toValue: nextCollapsed ? DRAWER_COLLAPSED : DRAWER_WIDE,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }

  return (
    <Animated.View style={[styles.drawerOuter, { width: animatedWidth }]}>
      <LinearGradient
        colors={GRADIENTS.sidebar as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.drawer, collapsed && styles.drawerCollapsed]}
      >
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={toggleCollapsed}
          accessibilityLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Text style={styles.toggleBtnText}>{collapsed ? '→' : '←'}</Text>
        </TouchableOpacity>

        <View style={[styles.logoSection, collapsed && styles.logoSectionCollapsed]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          {!collapsed && (
            <View style={styles.logoTextBlock}>
              <Text style={styles.logoName}>Learnova</Text>
              <Text style={styles.logoTagline}>AI Learning</Text>
            </View>
          )}
        </View>

        <View style={styles.navList}>
          {MAIN_NAV.map((item) => (
            <NavButton key={item.id} item={item} pathname={pathname} collapsed={collapsed} />
          ))}

          <View style={[styles.divider, collapsed && styles.dividerCollapsed]} />

          {SECONDARY_NAV.map((item) => (
            <NavButton key={item.id} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </View>

        <TouchableOpacity
          // @ts-expect-error title is supported on web for hover tooltips
          title={collapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : undefined}
          accessibilityLabel={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          style={[styles.darkModeBtn, collapsed && styles.darkModeBtnCollapsed]}
          onPress={toggleDarkMode}
        >
          <Text style={styles.darkModeEmoji}>{isDarkMode ? '☀️' : '🌙'}</Text>
          {!collapsed && (
            <Text style={styles.darkModeText}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          // @ts-expect-error title is supported on web for hover tooltips
          title={collapsed ? 'Sign Out' : undefined}
          accessibilityLabel="Sign Out"
          style={[styles.signOutBtn, collapsed && styles.signOutBtnCollapsed]}
          onPress={() => signOut()}
        >
          <Text style={styles.signOutEmoji}>🚪</Text>
          {!collapsed && <Text style={styles.signOutText}>Sign Out</Text>}
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  drawerOuter: {
    overflow: 'hidden',
    flexShrink: 0,
  },
  drawer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.08)',
    minHeight: '100%',
  },
  drawerCollapsed: {
    paddingHorizontal: SPACING.xs,
  },
  toggleBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    lineHeight: 14,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingRight: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoSectionCollapsed: {
    justifyContent: 'center',
    paddingRight: 0,
    gap: 0,
  },
  logoTextBlock: {
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoEmoji: { fontSize: 22 },
  logoName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  logoTagline: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.5)',
  },
  navList: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.sm,
  },
  dividerCollapsed: {
    marginHorizontal: SPACING.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    gap: 0,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderLeftColor: COLORS.primary,
  },
  navItemActiveCollapsed: {
    backgroundColor: 'transparent',
    borderLeftColor: COLORS.primary,
  },
  navEmoji: { fontSize: 18 },
  navEmojiCollapsed: {
    fontSize: 20,
    textAlign: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.75)',
  },
  navLabelActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  darkModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: 'auto',
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  darkModeBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    gap: 0,
  },
  darkModeEmoji: { fontSize: 16 },
  darkModeText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.7)',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  signOutBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    gap: 0,
  },
  signOutEmoji: { fontSize: 18 },
  signOutText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF6B6B',
  },
});
