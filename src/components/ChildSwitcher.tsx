/**
 * Quick child switcher bottom sheet.
 *
 * Mounted from the dashboard "active child" pill. Tapping a row loads
 * that child's saved XP / streak from Supabase and calls `setActiveChild`
 * in the app store — no page navigation, the user stays on the dashboard.
 */
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAppStore } from '@/store/appStore';
import {
  getChildren,
  loadChildProfile,
  type Child,
} from '@/services/dbService';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_FAMILY, SHADOWS } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';

interface ChildSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onChildSelected: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ChildSwitcher({
  visible,
  onClose,
  onChildSelected,
}: ChildSwitcherProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeChildId = useAppStore((s) => s.activeChildId);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      loadKids();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function loadKids() {
    setIsLoading(true);
    const kids = await getChildren();
    setChildren(kids);
    setIsLoading(false);
  }

  async function handleSelect(child: Child) {
    if (child.id === activeChildId) {
      onClose();
      return;
    }
    setSwitchingId(child.id);
    const profile = await loadChildProfile(child.id);
    setActiveChild({
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      grade: child.grade,
      language: child.language ?? 'en',
      xp: profile?.xp ?? 0,
      streak: profile?.streak ?? 0,
      lastStudyDate: profile?.lastStudyDate ?? null,
      lessonsCompleted: profile?.lessonsCompleted ?? 0,
      bestQuizScore: profile?.bestQuizScore ?? 0,
    });
    setSwitchingId(null);
    onChildSelected();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <Text style={styles.title}>{t('childSwitcherTitle')}</Text>
        <Text style={styles.subtitle}>{t('childSelectSubtitle')}</Text>

        {isLoading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginVertical: SPACING.xl }}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          >
            {children.map((child) => {
              const isActive = child.id === activeChildId;
              const isSwitching = switchingId === child.id;
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.childRow, isActive && styles.childRowActive]}
                  onPress={() => handleSelect(child)}
                  disabled={switchingId !== null}
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      isActive && styles.avatarCircleActive,
                    ]}
                  >
                    <Text style={styles.avatarText}>{child.avatar}</Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text
                      style={[
                        styles.childName,
                        isActive && styles.childNameActive,
                      ]}
                    >
                      {child.name}
                      {isActive && ' ✓'}
                    </Text>
                    <Text style={styles.childMeta}>
                      Primary {child.grade} ·{' '}
                      {child.language === 'en'
                        ? 'English'
                        : child.language === 'yo'
                          ? 'Yorùbá'
                          : child.language === 'ig'
                            ? 'Igbo'
                            : 'Hausa'}
                    </Text>
                  </View>
                  {isSwitching ? (
                    <ActivityIndicator color={COLORS.primary} size="small" />
                  ) : isActive ? (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>{t('childSwitcherActive')}</Text>
                    </View>
                  ) : (
                    <Text style={styles.switchArrow}>→</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {children.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👶</Text>
                <Text style={styles.emptyText}>
                  No children added yet.{'\n'}
                  Go to Children in the sidebar to add profiles.
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    maxHeight: SCREEN_HEIGHT * 0.75,
    ...SHADOWS.strong,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  list: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  childRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.backgroundDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleActive: {
    backgroundColor: 'rgba(0,135,81,0.15)',
  },
  avatarText: { fontSize: FONT_SIZES.xxxl },
  childInfo: { flex: 1 },
  childName: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  childNameActive: { color: COLORS.primaryDark },
  childMeta: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZES.xs,
  },
  switchArrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeBtn: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textSecondary,
  },
});
