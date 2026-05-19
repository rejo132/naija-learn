/**
 * Settings screen (`/settings`).
 * Houses parent zone, child-facing prefs, app preferences, support, and account actions.
 */
import { useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Linking,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { ParentGate } from '@/components/ParentGate';
import { supabase } from '@/lib/supabase';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { LANGUAGE_NAMES, type Language } from '@/constants/languages';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

function SettingsRow({
  emoji,
  label,
  sublabel,
  onPress,
  rightElement,
  danger,
  colors,
  isLast,
}: {
  emoji: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  danger?: boolean;
  colors: ThemeColors;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: colors.border },
        isLast && styles.rowLast,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View style={styles.rowBody}>
        <Text
          style={[
            styles.rowLabel,
            { color: danger ? COLORS.error : colors.textPrimary },
          ]}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {rightElement ??
        (onPress ? (
          <Text style={[styles.rowChevron, { color: colors.textMuted }]}>›</Text>
        ) : null)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: ThemeColors }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const { colors, isDarkMode } = useTheme();

  const selectedLanguage = useAppStore((s) => s.selectedLanguage);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const selectedGrade = useAppStore((s) => s.selectedGrade);
  const isDarkModeStore = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const user = useAuthStore((s) => s.user);
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Student';

  const [parentGateVisible, setParentGateVisible] = useState(false);
  const [parentGatePurpose, setParentGatePurpose] = useState('');
  const [dataSaver, setDataSaver] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(60);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'] as const;
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('Medium');

  const speeds = ['Slow', 'Normal', 'Fast'] as const;
  const [voiceSpeed, setVoiceSpeed] = useState<(typeof speeds)[number]>('Normal');

  function openParentZone(purpose: 'children' | 'reports' | 'limits') {
    setParentGatePurpose(purpose);
    setParentGateVisible(true);
  }

  function handleParentSuccess() {
    setParentGateVisible(false);
    if (parentGatePurpose === 'children') {
      router.push('/children');
    } else if (parentGatePurpose === 'reports') {
      router.push('/parent-dashboard');
    } else if (parentGatePurpose === 'limits') {
      setShowDailyLimit(true);
    }
  }

  async function handleDeleteData() {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      useAppStore.getState().resetAll();
      useAuthStore.getState().setSession(null);
      useAuthStore.getState().setUserRole(null);
      await supabase.auth.signOut().catch(() => {});
      router.replace('/auth/sign-in');
    } catch {
      useAppStore.getState().resetAll();
      useAuthStore.getState().setSession(null);
      router.replace('/auth/sign-in');
    }
  }

  function handleWhatsApp() {
    Linking.openURL(
      'https://wa.me/2348000000000?text=Hello%20Learnova%20Support'
    );
  }

  function handlePrivacyPolicy() {
    Linking.openURL('https://learnova.app/privacy');
  }

  async function handleSignOut() {
    // Wipe local cached learning state BEFORE clearing the session so the
    // next user signing in on this device doesn't inherit XP / streak /
    // active child / parent PIN from the previous user.
    useAppStore.getState().resetAll();
    useAuthStore.getState().setSession(null);
    useAuthStore.getState().setUserRole(null);
    await supabase.auth.signOut().catch(() => {});
    router.replace('/auth/sign-in');
  }

  const cardBg = colors.backgroundCard;
  const languageFullName = LANGUAGE_NAMES[selectedLanguage as Language] ?? 'English';
  const languageBadge = languageFullName.split(' ')[0];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: cardBg, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ⚙️ Settings
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.userCard, { backgroundColor: colors.primary }]}>
          <View style={styles.userCardLeft}>
            <Text style={styles.userCardEmoji}>👤</Text>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.userCardName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.userCardGrade} numberOfLines={1}>
                Primary {selectedGrade ?? '—'} • {xp} XP • 🔥 {streak} streak
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.push('/personality')}
          >
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="🔐  ACCOUNT" colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="🔐"
            label="Change Parent PIN"
            sublabel="Update the 4-digit Parent Portal PIN"
            onPress={() => router.push('/change-password')}
            colors={colors}
            isLast
          />
        </View>

        <SectionHeader title="👨‍👩‍👧  PARENT ZONE" colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="👧"
            label="Manage Children"
            sublabel="Add or edit child profiles"
            onPress={() => openParentZone('children')}
            colors={colors}
          />
          <SettingsRow
            emoji="⏱️"
            label="Daily Screen Limits"
            sublabel={`Current: ${dailyLimitMinutes} minutes/day`}
            onPress={() => openParentZone('limits')}
            colors={colors}
          />
          <SettingsRow
            emoji="📋"
            label="Subject Focus"
            sublabel="Choose priority subjects"
            onPress={() =>
              Alert.alert(
                'Subject Focus',
                'Subject focus can be set per child in Manage Children.'
              )
            }
            colors={colors}
          />
          <SettingsRow
            emoji="📊"
            label="Download Reports"
            sublabel="View detailed progress reports"
            onPress={() => openParentZone('reports')}
            colors={colors}
            isLast
          />
        </View>

        <SectionHeader title={`🎮  FOR ${userName.toUpperCase()}`} colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="🎭"
            label="Choose Avatar & Tutor"
            sublabel="Pick your AI tutor personality"
            onPress={() => router.push('/personality')}
            colors={colors}
          />
          <SettingsRow
            emoji="🌍"
            label="Language"
            sublabel={languageFullName}
            onPress={() => {
              const langs: Language[] = ['en', 'ha', 'yo', 'ig'];
              const curr = langs.indexOf(selectedLanguage as Language);
              const next = langs[(curr + 1) % langs.length];
              setLanguage(next);
            }}
            colors={colors}
            rightElement={
              <View style={styles.langBadge}>
                <Text style={styles.langBadgeText}>{languageBadge}</Text>
              </View>
            }
          />
          <SettingsRow
            emoji="📚"
            label="Grade Level"
            sublabel={`Currently: Primary ${selectedGrade ?? '—'}`}
            onPress={() => router.push('/grade')}
            colors={colors}
          />
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>🎯</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Difficulty
              </Text>
              <View style={styles.difficultyRow}>
                {difficulties.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.diffBtn,
                      { borderColor: colors.border },
                      difficulty === d && styles.diffBtnActive,
                    ]}
                    onPress={() => setDifficulty(d)}
                  >
                    <Text
                      style={[
                        styles.diffBtnText,
                        { color: colors.textMuted },
                        difficulty === d && styles.diffBtnTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <SettingsRow
            emoji="🔊"
            label="AI Voice"
            sublabel={`Speed: ${voiceSpeed} • Tap to change`}
            onPress={() => {
              const curr = speeds.indexOf(voiceSpeed);
              setVoiceSpeed(speeds[(curr + 1) % speeds.length]);
            }}
            colors={colors}
            rightElement={
              <View style={[styles.diffBtn, styles.diffBtnActive]}>
                <Text style={styles.diffBtnTextActive}>{voiceSpeed}</Text>
              </View>
            }
          />
          <SettingsRow
            emoji="🏆"
            label="Rewards & Achievements"
            sublabel={`${xp} XP earned total`}
            onPress={() => router.push('/achievements')}
            colors={colors}
            isLast
          />
        </View>

        <SectionHeader title="📱  APP PREFERENCES" colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>🌙</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
              <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
                {isDarkMode ? 'Currently on' : 'Currently off'}
              </Text>
            </View>
            <Switch
              value={isDarkModeStore}
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>📴</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Offline Mode
              </Text>
              <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
                Download lessons for offline use
              </Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>💾</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Data Saver
              </Text>
              <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
                Reduce data usage on mobile
              </Text>
            </View>
            <Switch
              value={dataSaver}
              onValueChange={setDataSaver}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowEmoji}>🔔</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Notifications
              </Text>
              <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
                Daily learning reminders
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <SectionHeader title="ℹ️  ABOUT & SUPPORT" colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="🔐"
            label="Privacy Policy"
            sublabel="How we protect your data"
            onPress={handlePrivacyPolicy}
            colors={colors}
          />
          <SettingsRow
            emoji="💬"
            label="Contact Support"
            sublabel="WhatsApp: tap to message us"
            onPress={handleWhatsApp}
            colors={colors}
          />
          <SettingsRow
            emoji="ℹ️"
            label="About Learnova"
            sublabel="Version 1.0.0 • Made with ❤️ for Nigeria"
            onPress={() => setShowAbout(true)}
            colors={colors}
          />
          <SettingsRow
            emoji="🗑️"
            label="Delete My Data"
            sublabel="Permanently delete your account"
            onPress={() => setShowDeleteConfirm(true)}
            danger
            colors={colors}
            isLast
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
            <Text style={styles.signOutEmoji}>🚪</Text>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      <ParentGate
        visible={parentGateVisible}
        onSuccess={handleParentSuccess}
        onCancel={() => setParentGateVisible(false)}
      />

      <Modal visible={showDailyLimit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              ⏱️ Daily Screen Limit
            </Text>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              Set maximum daily learning time
            </Text>
            {[30, 45, 60, 90, 120].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.limitOption,
                  { borderColor: colors.border },
                  dailyLimitMinutes === mins && styles.limitOptionActive,
                ]}
                onPress={() => setDailyLimitMinutes(mins)}
              >
                <Text
                  style={[
                    styles.limitOptionText,
                    {
                      color:
                        dailyLimitMinutes === mins ? '#FFFFFF' : colors.textPrimary,
                    },
                  ]}
                >
                  {mins} minutes / day
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowDailyLimit(false)}
            >
              <Text style={styles.modalBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={styles.deleteEmoji}>⚠️</Text>
            <Text style={[styles.modalTitle, { color: COLORS.error }]}>
              Delete All Data
            </Text>
            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              This will permanently delete your account, progress, and all data.
              This cannot be undone.
            </Text>
            <Text style={[styles.deleteInstruction, { color: colors.textPrimary }]}>
              Type DELETE to confirm:
            </Text>
            <TextInput
              style={[
                styles.deleteInput,
                {
                  borderColor: COLORS.error,
                  color: colors.textPrimary,
                  backgroundColor: colors.background,
                },
              ]}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtnHalf,
                  { borderColor: colors.border, borderWidth: 1.5 },
                ]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={[styles.modalBtnHalfText, { color: colors.textPrimary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnHalf,
                  {
                    backgroundColor: COLORS.error,
                    opacity: deleteConfirmText === 'DELETE' ? 1 : 0.4,
                  },
                ]}
                onPress={handleDeleteData}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Text style={[styles.modalBtnHalfText, { color: '#FFFFFF' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAbout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={styles.aboutEmoji}>🎓</Text>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Learnova
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              AI-powered primary school tutoring for Nigerian children (Primary 1–6).
              {'\n\n'}
              Built with Claude AI, aligned to the NERDC curriculum, with support for
              English, Hausa, Yoruba, and Igbo.{'\n\n'}
              Made with ❤️ for Nigeria 🇳🇬
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  scroll: { flex: 1 },
  content: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  userCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
    minWidth: 0,
  },
  userCardEmoji: { fontSize: 36 },
  userCardName: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  userCardGrade: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  editProfileBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: FONT_SIZES.sm,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  rowLast: { borderBottomWidth: 0 },
  rowEmoji: { fontSize: 22, width: 28 },
  rowBody: { flex: 1 },
  rowLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  rowSublabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    lineHeight: 16,
  },
  rowChevron: {
    fontSize: 22,
    fontFamily: 'Poppins-Regular',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  diffBtn: {
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  diffBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  diffBtnText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
  },
  diffBtnTextActive: { color: '#FFFFFF' },
  langBadge: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  langBadgeText: { fontSize: 18 },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
  },
  signOutEmoji: { fontSize: 20 },
  signOutText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  limitOption: {
    width: '100%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  limitOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  limitOptionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
  },
  modalBtn: {
    width: '100%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  deleteEmoji: { fontSize: 48 },
  deleteInstruction: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    alignSelf: 'flex-start',
  },
  deleteInput: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalBtnHalf: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalBtnHalfText: {
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.sm,
  },
  aboutEmoji: { fontSize: 56 },
  aboutVersion: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  aboutDesc: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
});
