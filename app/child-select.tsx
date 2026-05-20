/**
 * Child selection screen (`/child-select`).
 *
 * Shown after sign-in when the parent has at least one child profile,
 * or when switching the active child from the dashboard. Each pick
 * loads that child's saved XP / streak from Supabase and sets them as
 * the active learner in the app store.
 */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { getChildren, loadChildProfile, type Child } from '@/services/dbService';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { GlassCard } from '@/components/GlassCard';
import { ParentGate } from '@/components/ParentGate';
import { useTranslation } from '@/hooks/useTranslation';

export default function ChildSelectScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const { t } = useTranslation();

  useEffect(() => {
    loadChildren();
  }, []);

  async function loadChildren() {
    setIsLoading(true);
    const kids = await getChildren();
    setChildren(kids);
    setIsLoading(false);
  }

  async function handleSelectChild(child: Child) {
    setSelectingId(child.id);

    const profile = await loadChildProfile(child.id);

    setActiveChild({
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      grade: child.grade,
      language: child.language_preference,
      xp: profile?.xp ?? 0,
      streak: profile?.streak ?? 0,
      lastStudyDate: profile?.lastStudyDate ?? null,
    });

    setSelectingId(null);
    router.replace('/dashboard');
  }

  function handleAddChild() {
    // Adding/removing children is a parent action — gate it behind the PIN
    // even though we reached this screen from inside an authenticated session.
    // A child sitting on the picker shouldn't be able to delete their siblings.
    setShowParentGate(true);
  }

  async function handleSignOut() {
    // Wipe local cached learning state BEFORE clearing the session so the
    // next user signing in on this device doesn't inherit XP / streak /
    // active child / parent PIN from the previous user.
    useAppStore.getState().resetAll();
    // useAuthStore.signOut() internally calls supabase.auth.signOut() and
    // also clears the local session/user/role — keeping it single-source.
    await useAuthStore.getState().signOut();
    router.replace('/auth/sign-in');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#003D25', '#008751', '#00A651']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🎓</Text>
          <Text style={styles.logoName}>Learnova</Text>
          <Text style={styles.question}>{t('childSelectTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('childSelectSubtitle')}
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={{ marginTop: 40 }}
          />
        ) : children.length === 0 ? (
          <View style={styles.emptyState}>
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👶</Text>
              <Text style={styles.emptyTitle}>{t('childrenEmpty')}</Text>
              <Text style={styles.emptySubtitle}>
                {t('childrenEmptySubtitle')}
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddChild}
              >
                <Text style={styles.addBtnText}>+ {t('childrenAdd')}</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        ) : (
          <FlatList
            data={children}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.childCard}
                onPress={() => handleSelectChild(item)}
                disabled={selectingId !== null}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.childCardGradient}
                >
                  {selectingId === item.id ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.childAvatar}>{item.avatar}</Text>
                  )}
                  <Text style={styles.childName}>{item.name}</Text>
                  <Text style={styles.childGrade}>
                    Primary {item.grade}
                  </Text>
                  <View style={styles.childLangBadge}>
                    <Text style={styles.childLangText}>
                      {item.language_preference === 'en'
                        ? '🇳🇬 English'
                        : item.language_preference === 'yo'
                          ? 'Yorùbá'
                          : item.language_preference === 'ig'
                            ? 'Igbo'
                            : 'Hausa'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        )}

        {children.length > 0 && (
          <TouchableOpacity
            style={styles.addMoreBtn}
            onPress={handleAddChild}
          >
            <Text style={styles.addMoreText}>+ {t('childSelectAdd')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.signOutLink}
          activeOpacity={0.7}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>{t('settingsSignOut')}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ParentGate
        visible={showParentGate}
        onSuccess={() => {
          setShowParentGate(false);
          router.push('/children');
        }}
        onCancel={() => setShowParentGate(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: SPACING.lg },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  logoEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  logoName: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xl,
  },
  question: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  grid: {
    paddingBottom: SPACING.xl,
  },
  gridRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  childCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  childCardGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    minHeight: 160,
    justifyContent: 'center',
  },
  childAvatar: { fontSize: 48 },
  childName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  childGrade: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.75)',
  },
  childLangBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginTop: 4,
  },
  childLangText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xxl,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    width: '100%',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  addMoreBtn: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: SPACING.lg,
  },
  addMoreText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.sm,
  },
  signOutLink: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  signOutText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins-Regular',
    fontSize: FONT_SIZES.sm,
  },
});
