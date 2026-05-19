/**
 * Change password screen (`/change-password`).
 *
 * Reachable from Settings → Account. Re-authenticates the user with their
 * current password before calling `supabase.auth.updateUser` so a stolen
 * session alone cannot change the password.
 */
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '@/constants/theme';
import { GlassCard } from '@/components/GlassCard';
import { Atmosphere } from '@/components/Atmosphere';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const newPasswordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  function validate(): string | null {
    if (!currentPassword.trim()) return 'Please enter your current password';
    if (!newPassword.trim()) return 'Please enter a new password';
    if (newPassword.length < 6)
      return 'New password must be at least 6 characters';
    if (newPassword === currentPassword)
      return 'New password must be different from current password';
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return null;
  }

  async function handleChangePassword() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Session expired. Please sign in again.');
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.back(), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const submitDisabled =
    isLoading || !currentPassword || !newPassword || !confirmPassword;

  return (
    <SafeAreaView style={styles.safe}>
      <Atmosphere pointerEvents="none" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {success ? (
          <GlassCard style={styles.successCard}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Password Changed!</Text>
            <Text style={styles.successSubtitle}>
              Your password has been updated successfully.
              Going back...
            </Text>
          </GlassCard>
        ) : (
          <GlassCard style={styles.formCard}>
            <Text style={styles.formTitle}>🔐 Update Password</Text>
            <Text style={styles.formSubtitle}>
              Enter your current password then choose a new one
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => setError(null)}>
                  <Text style={styles.errorDismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showCurrent}
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                <Text style={styles.eyeIcon}>{showCurrent ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={newPasswordRef}
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showNew}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNew(!showNew)}
              >
                <Text style={styles.eyeIcon}>{showNew ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          newPassword.length >= i * 3
                            ? newPassword.length >= 10
                              ? COLORS.success
                              : newPassword.length >= 6
                                ? COLORS.warning
                                : COLORS.error
                            : COLORS.border,
                      },
                    ]}
                  />
                ))}
                <Text style={styles.strengthLabel}>
                  {newPassword.length < 6
                    ? 'Too short'
                    : newPassword.length < 10
                      ? 'Good'
                      : 'Strong'}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                ref={confirmPasswordRef}
                style={[
                  styles.input,
                  confirmPassword.length > 0 &&
                    confirmPassword !== newPassword &&
                    styles.inputError,
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirm}
                returnKeyType="go"
                onSubmitEditing={handleChangePassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 &&
              confirmPassword !== newPassword && (
                <Text style={styles.mismatchText}>Passwords do not match</Text>
              )}

            <TouchableOpacity
              style={[styles.submitBtn, submitDisabled && styles.submitBtnDisabled]}
              onPress={handleChangePassword}
              disabled={submitDisabled}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backArrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primaryDark,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  formCard: {
    padding: SPACING.xl,
    gap: SPACING.xs,
  },
  formTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  errorDismiss: {
    color: COLORS.error,
    fontWeight: '700',
    paddingLeft: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAF9',
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
  },
  inputError: {
    color: COLORS.error,
  },
  eyeBtn: {
    padding: SPACING.sm,
  },
  eyeIcon: { fontSize: 16 },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4,
    marginBottom: SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  mismatchText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.error,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.soft,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  cancelBtn: {
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontFamily: 'Poppins-Regular',
    fontSize: FONT_SIZES.sm,
  },
  successCard: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xxl,
  },
  successEmoji: { fontSize: 64 },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.success,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
