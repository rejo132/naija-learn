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
import { useTranslation } from '@/hooks/useTranslation';

const DRAWER_WIDE = 240;
const DRAWER_COLLAPSED = 64;

interface NavItem {
  id: string;
  label: string;
  emoji: string;
  route: string;
}

function NavButton({
  item,
  collapsed,
  onNavPress,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavPress: (route: string) => void;
  isActive: boolean;
}) {

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
      onPress={() => onNavPress(item.route)}
    >
      <Text style={[styles.navEmoji, collapsed && styles.navEmojiCollapsed]}>{item.emoji}</Text>
      {!collapsed && (
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {item.label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function SideDrawer() {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const animatedWidth = useRef(new Animated.Value(DRAWER_WIDE)).current;

  const MAIN_NAV: NavItem[] = [
    { id: 'home', label: t('home'), emoji: '🏠', route: '/dashboard' },
    { id: 'learn', label: t('learn'), emoji: '📚', route: '/dashboard' },
    { id: 'progress', label: t('progress'), emoji: '📈', route: '/progress' },
    { id: 'achievements', label: t('achievements'), emoji: '🏆', route: '/achievements' },
  ];

  const SECONDARY_NAV: NavItem[] = [
    { id: 'personality', label: t('myTutor'), emoji: '👩🏽‍🏫', route: '/personality' },
    { id: 'settings', label: 'Settings', emoji: '⚙️', route: '/settings' },
  ];

  if (width <= 768) return null;
  if (pathname.startsWith('/auth')) return null;

  function isActive(route: string): boolean {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/' || pathname === '';
    }
    return pathname === route || pathname.startsWith(route + '/');
  }

  async function handleSignOut() {
    try {
      await useAuthStore.getState().signOut();
      router.replace('/auth/sign-in');
    } catch {
      useAppStore.getState().resetSession();
      useAppStore.getState().setIsSignedOut(true);
      useAuthStore.getState().setSession(null);
      useAuthStore.getState().setUserRole(null);
      router.replace('/auth/sign-in');
    }
  }

  function goDashboard() {
    try {
      router.dismissAll();
    } catch {
      // dismissAll throws when stack is empty
    }
    router.replace('/dashboard');
  }

  function handleNavPress(route: string) {
    if (route === '/dashboard') {
      goDashboard();
      return;
    }
    router.push(route as '/');
  }

  function handleHomePress() {
    try {
      router.dismissAll();
    } catch {
      // dismissAll throws when stack is empty
    }
    router.replace('/dashboard');
  }

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
      <Animated.View style={[styles.drawer, { width: animatedWidth }]}>
        <LinearGradient
          colors={isDarkMode ? GRADIENTS.primaryDeep : GRADIENTS.sidebar}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.drawerInner}>
          <View style={styles.logoRow}>
            {!collapsed && (
              <Text style={styles.logoText}>Learnova</Text>
            )}
            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={toggleCollapsed}
              accessibilityLabel={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <Text style={styles.collapseIcon}>{collapsed ? '→' : '←'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.navSection}>
            {MAIN_NAV.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                collapsed={collapsed}
                onNavPress={handleNavPress}
                isActive={isActive(item.route)}
              />
            ))}
          </View>

          <View style={styles.navDivider} />

          <View style={styles.navSection}>
            {SECONDARY_NAV.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                collapsed={collapsed}
                onNavPress={handleNavPress}
                isActive={isActive(item.route)}
              />
            ))}
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.themeBtn, collapsed && styles.themeBtnCollapsed]}
            onPress={toggleDarkMode}
          >
            <Text style={styles.themeEmoji}>{isDarkMode ? '☀️' : '🌙'}</Text>
            {!collapsed && (
              <Text style={styles.themeLabel}>{t('settingsDarkMode')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            // @ts-expect-error title is supported on web for hover tooltips
            title={collapsed ? t('signOut') : undefined}
            accessibilityLabel={t('signOut')}
            style={[styles.signOutBtn, collapsed && styles.signOutBtnCollapsed]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutEmoji}>🚪</Text>
            {!collapsed && <Text style={styles.signOutText}>{t('signOut')}</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
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
  },
  drawerInner: {
    flex: 1,
    zIndex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  collapseBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseIcon: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  navSection: {
    gap: SPACING.xs,
  },
  navDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: SPACING.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  navItemActiveCollapsed: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  navEmoji: { fontSize: 20 },
  navEmojiCollapsed: { fontSize: 22 },
  navLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  themeBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  themeEmoji: { fontSize: 20 },
  themeLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  signOutBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  signOutEmoji: { fontSize: 20 },
  signOutText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
});
