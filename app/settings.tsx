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
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { goBack } from '@/utils/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { LANGUAGE_NAMES, type Language } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { AVATAR_UNLOCKS } from '@/constants/levels';
import { syncProfile } from '@/services/dbService';
import { playSound } from '@/services/soundService';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
} from '@/services/notificationService';
import type { DifficultyLevel, VoiceSpeedLevel } from '@/store/appStore';

// TODO: Replace with real support number before handover to buyer
const SUPPORT_WHATSAPP = '2348000000000';
const SUPPORT_EMAIL = 'support@trylearnova.com';

const LANG_NATIVE: Record<string, string> = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
};

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
          <ChevronRight size={20} color={colors.textMuted} />
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
  const { t } = useTranslation();

  const selectedLanguage = useAppStore((s) => s.selectedLanguage);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const selectedGrade = useAppStore((s) => s.selectedGrade);
  const isDarkModeStore = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const userAvatar = useAppStore((s) => s.userAvatar);
  const setUserAvatar = useAppStore((s) => s.setUserAvatar);
  const selectedPersonalityId = useAppStore((s) => s.selectedPersonalityId);
  const unlockedAvatars = useAppStore((s) => s.unlockedAvatars);
  const [avatarHint, setAvatarHint] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Student';

  const offlineMode = useAppStore((s) => s.offlineMode);
  const setOfflineMode = useAppStore((s) => s.setOfflineMode);
  const dataSaver = useAppStore((s) => s.dataSaver);
  const setDataSaver = useAppStore((s) => s.setDataSaver);
  const notifications = useAppStore((s) => s.notificationsEnabled);
  const setNotifications = useAppStore((s) => s.setNotificationsEnabled);
  const notificationHour = useAppStore((s) => s.notificationHour);
  const notificationMinute = useAppStore((s) => s.notificationMinute);
  const setNotificationHour = useAppStore((s) => s.setNotificationHour);
  const storeUserName = useAppStore((s) => s.userName);
  const difficulty = useAppStore((s) => s.difficulty);
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  const voiceSpeed = useAppStore((s) => s.voiceSpeed);
  const setVoiceSpeed = useAppStore((s) => s.setVoiceSpeed);
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(60);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const difficulties = ['Easy', 'Medium', 'Hard'] as const satisfies readonly DifficultyLevel[];
  const speeds = ['Slow', 'Normal', 'Fast'] as const satisfies readonly VoiceSpeedLevel[];

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

  function handleSupport() {
    Alert.alert(
      'Contact Support',
      'How would you like to reach us?',
      [
        {
          text: '💬 WhatsApp',
          onPress: () =>
            Linking.openURL(
              `https://wa.me/${SUPPORT_WHATSAPP}` +
                `?text=Hello%2C%20I%20need%20help%20with%20Learnova`
            ),
        },
        {
          text: '✉️ Email',
          onPress: () =>
            Linking.openURL(
              `mailto:${SUPPORT_EMAIL}?subject=Learnova%20Support`
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  function handlePrivacyPolicy() {
    Linking.openURL('https://learnova.app/privacy');
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) return;

    if (newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Passwords do not match. Try again!');
      return;
    }

    setPasswordChangeLoading(true);
    setPasswordChangeError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordChangeError('Could not update password. Please try again.');
      } else {
        setPasswordChangeSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordChangeSuccess(false);
        }, 2000);
      }
    } catch {
      setPasswordChangeError('Something went wrong. Try again!');
    } finally {
      setPasswordChangeLoading(false);
    }
  }

  async function handleSignOut() {
    await useAuthStore.getState().signOut();
    router.replace('/auth/sign-in');
  }

  const cardBg = colors.backgroundCard;
  const languageFullName = LANGUAGE_NAMES[selectedLanguage as Language] ?? 'English';
  const languageNative = LANG_NATIVE[selectedLanguage] ?? 'English';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: cardBg, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          ⚙️ {t('settingsTitle')}
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
            <Text style={styles.userCardEmoji}>{userAvatar || '👤'}</Text>
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

        <SectionHeader title={`🎮  ${t('settingsForChild').toUpperCase()}: ${userName.toUpperCase()}`} colors={colors} />
        <View style={[styles.avatarSection, { backgroundColor: cardBg }]}>
          <Text style={[styles.avatarSectionTitle, { color: colors.textPrimary }]}>
            Your Avatar
          </Text>
          <Text style={[styles.avatarSectionSub, { color: colors.textMuted }]}>
            Earn XP to unlock more!
          </Text>
          <View style={styles.avatarGrid}>
            {AVATAR_UNLOCKS.map((avatar) => {
              const isUnlocked = xp >= avatar.requiredXP;
              const isSelected = userAvatar === avatar.emoji;
              return (
                <TouchableOpacity
                  key={avatar.emoji}
                  style={[
                    styles.avatarCell,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isUnlocked
                        ? colors.background
                        : colors.primaryLight,
                      opacity: isUnlocked ? 1 : 0.5,
                    },
                    isSelected && styles.avatarCellSelected,
                  ]}
                  onPress={() => {
                    if (!isUnlocked) {
                      setAvatarHint(avatar.hint);
                      return;
                    }
                    setUserAvatar(avatar.emoji);
                    syncProfile({
                      name: userName,
                      grade: selectedGrade ?? 1,
                      avatar: avatar.emoji,
                      xp,
                      streak,
                      language: selectedLanguage,
                      personalityId: selectedPersonalityId,
                      lastActiveDate:
                        new Date().toISOString().split('T')[0],
                    }).catch(() => {});
                  }}
                  onLongPress={() => {
                    if (!isUnlocked) setAvatarHint(avatar.hint);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarCellEmoji}>
                    {isUnlocked ? avatar.emoji : '🔒'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {avatarHint ? (
            <Text style={[styles.avatarHint, { color: colors.textMuted }]}>
              {avatarHint} to unlock
            </Text>
          ) : null}
          <Text style={[styles.avatarCount, { color: colors.textSecondary }]}>
            {AVATAR_UNLOCKS.filter((a) => xp >= a.requiredXP).length} / 12 avatars
            unlocked
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="🎭"
            label="Choose Tutor Personality"
            sublabel="Pick your AI tutor personality"
            onPress={() => router.push('/personality')}
            colors={colors}
          />
          <SettingsRow
            emoji="🌍"
            label={t('settingsLanguage')}
            sublabel={languageFullName}
            onPress={() => {
              const langs: Language[] = ['en', 'ha', 'yo', 'ig'];
              const curr = langs.indexOf(selectedLanguage as Language);
              const next = langs[(curr + 1) % langs.length];
              setLanguage(next);
            }}
            colors={colors}
            rightElement={
              <Text
                style={{
                  fontSize: FONT_SIZES.xs,
                  fontFamily: 'Poppins-SemiBold',
                  color: colors.primary,
                  backgroundColor: colors.primaryLight,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                {languageNative}
              </Text>
            }
          />
          <SettingsRow
            emoji="📚"
            label={t('settingsGrade')}
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
          />
          <SettingsRow
            emoji="🔑"
            label="Change Password"
            sublabel="Update your secret password"
            onPress={() => {
              setShowPasswordChange(true);
              setPasswordChangeError('');
              setPasswordChangeSuccess(false);
              setNewPassword('');
              setConfirmPassword('');
            }}
            colors={colors}
            isLast
          />
        </View>

        <SectionHeader title={`📱  ${t('settingsAppPrefs').toUpperCase()}`} colors={colors} />
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <SettingsRow
            emoji="🔊"
            label="Sound Effects"
            sublabel="Chimes, taps and celebrations"
            colors={colors}
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={(v) => {
                  setSoundEnabled(v);
                  if (v) playSound('tap');
                }}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>🌙</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                {t('settingsDarkMode')}
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
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowEmoji}>🔔</Text>
            <View style={styles.rowBody}>
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Daily Reminders
              </Text>
              <Text style={[styles.rowSublabel, { color: colors.textMuted }]}>
                Get reminded to learn every day
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={async (v) => {
                setNotifications(v);
                if (v) {
                  const granted = await scheduleDailyReminder(
                    notificationHour,
                    notificationMinute,
                    storeUserName || userName
                  );
                  if (!granted) {
                    setNotifications(false);
                  }
                } else {
                  await cancelDailyReminder();
                }
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {notifications && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.sm,
                borderTopWidth: 1,
                borderTopColor: colors.border + '40',
              }}
            >
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  fontFamily: 'Poppins-Regular',
                  color: colors.textMuted,
                }}
              >
                Reminder time
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  flex: 1,
                }}
              >
                {[8, 12, 14, 16, 18, 20].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => {
                      setNotificationHour(h);
                      scheduleDailyReminder(
                        h,
                        notificationMinute,
                        storeUserName || userName
                      ).catch(() => {});
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      backgroundColor:
                        notificationHour === h
                          ? colors.primary
                          : colors.border + '60',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: 'Poppins-SemiBold',
                        color:
                          notificationHour === h ? '#FFFFFF' : colors.textMuted,
                      }}
                    >
                      {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <SectionHeader title={`ℹ️  ${t('settingsAbout').toUpperCase()}`} colors={colors} />
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
            onPress={handleSupport}
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
          <TouchableOpacity
            style={styles.signOutRow}
            activeOpacity={0.75}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutEmoji}>🚪</Text>
            <Text style={styles.signOutText}>{t('settingsSignOut')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

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
              {t('deleteAccountConfirm')}
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

      <Modal visible={showPasswordChange} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardBg }]}>
            <Text style={{ fontSize: 48 }}>🔑</Text>

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Change Password
            </Text>

            <Text style={[styles.modalSub, { color: colors.textMuted }]}>
              Choose a new secret password that only you know!
            </Text>

            {passwordChangeSuccess ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 48 }}>✅</Text>
                <Text
                  style={{
                    color: '#2E9E5A',
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  Password changed! 🎉
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.deleteInput,
                    {
                      borderColor: colors.border,
                      borderWidth: 1.5,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      width: '100%',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>🔒</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontFamily: 'Poppins-Regular',
                      color: colors.textPrimary,
                      paddingVertical: 12,
                      letterSpacing: 0,
                      textAlign: 'left',
                    }}
                    placeholder="New password"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View
                  style={[
                    styles.deleteInput,
                    {
                      borderColor: colors.border,
                      borderWidth: 1.5,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      width: '100%',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>✅</Text>
                  <TextInput
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontFamily: 'Poppins-Regular',
                      color: colors.textPrimary,
                      paddingVertical: 12,
                      letterSpacing: 0,
                      textAlign: 'left',
                    }}
                    placeholder="Type it again"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {passwordChangeError ? (
                  <Text
                    style={{
                      color: '#E53935',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  >
                    ⚠️ {passwordChangeError}
                  </Text>
                ) : null}

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtnHalf,
                      { borderColor: colors.border, borderWidth: 1.5 },
                    ]}
                    onPress={() => setShowPasswordChange(false)}
                    disabled={passwordChangeLoading}
                  >
                    <Text style={[styles.modalBtnHalfText, { color: colors.textPrimary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtnHalf,
                      {
                        backgroundColor: colors.primary,
                        opacity:
                          newPassword.length >= 6 &&
                          confirmPassword.length >= 6 &&
                          !passwordChangeLoading
                            ? 1
                            : 0.4,
                      },
                    ]}
                    onPress={handleChangePassword}
                    disabled={
                      newPassword.length < 6 ||
                      confirmPassword.length < 6 ||
                      passwordChangeLoading
                    }
                  >
                    {passwordChangeLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={[styles.modalBtnHalfText, { color: '#FFFFFF' }]}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  avatarSection: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  avatarSectionSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    marginBottom: SPACING.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  avatarCell: {
    width: '15%',
    minWidth: 48,
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCellSelected: {
    borderWidth: 3,
  },
  avatarCellEmoji: {
    fontSize: 32,
  },
  avatarHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  avatarCount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginTop: SPACING.md,
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
