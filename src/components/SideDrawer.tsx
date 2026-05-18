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
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ParentGate } from '@/components/ParentGate';

const DRAWER_WIDE = 240;
const DRAWER_COLLAPSED = 64;

const PARENT_ROUTES = ['/children', '/parent-dashboard'];

function isParentRoute(route: string) {
  return PARENT_ROUTES.includes(route);
}

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
          {isParentRoute(item.route) && (
            <Text style={styles.parentBadge}> 🔐</Text>
          )}
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
  const [gateVisible, setGateVisible] = useState(false);
  const [pendingRoute, setPendingRoute] = useState('');
  const animatedWidth = useRef(new Animated.Value(DRAWER_WIDE)).current;

  const MAIN_NAV: NavItem[] = [
    { id: 'home', label: t('home'), emoji: '🏠', route: '/dashboard' },
    { id: 'learn', label: t('learn'), emoji: '📚', route: '/dashboard' },
    { id: 'progress', label: t('progress'), emoji: '📈', route: '/progress' },
    { id: 'achievements', label: t('achievements'), emoji: '🏆', route: '/achievements' },
  ];

  const SECONDARY_NAV: NavItem[] = [
    { id: 'personality', label: t('myTutor'), emoji: '👩🏽‍🏫', route: '/personality' },
    { id: 'children', label: t('children'), emoji: '👨‍👩‍👧', route: '/children' },
    { id: 'reports', label: t('reports'), emoji: '📊', route: '/parent-dashboard' },
  ];

  if (width <= 768) return null;
  if (pathname.startsWith('/auth')) return null;

  function isActive(route: string): boolean {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === route || pathname.startsWith(route);
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      useAuthStore.getState().setSession(null);
      useAuthStore.getState().setUserRole(null);

      router.replace('/auth/sign-in');
    } catch (e) {
      console.error('Sign out error:', e);
      router.replace('/auth/sign-in');
    }
  }

  function handleNavPress(route: string) {
    if (route === '/dashboard') {
      router.replace('/dashboard');
      return;
    }
    if (route === '/children' || route === '/parent-dashboard') {
      setPendingRoute(route);
      setGateVisible(true);
      return;
    }
    router.push(route as '/');
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
    <>
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
              <NavButton
                key={item.id}
                item={item}
                collapsed={collapsed}
                onNavPress={handleNavPress}
                isActive={isActive(item.route)}
              />
            ))}

            <View style={[styles.divider, collapsed && styles.dividerCollapsed]} />

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
            title={collapsed ? t('signOut') : undefined}
            accessibilityLabel={t('signOut')}
            style={[styles.signOutBtn, collapsed && styles.signOutBtnCollapsed]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutEmoji}>🚪</Text>
            {!collapsed && <Text style={styles.signOutText}>{t('signOut')}</Text>}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <ParentGate
        visible={gateVisible}
        onSuccess={() => {
          setGateVisible(false);
          if (pendingRoute) {
            router.push(pendingRoute as '/');
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
  parentBadge: {
    fontSize: FONT_SIZES.sm,
    opacity: 0.85,
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
