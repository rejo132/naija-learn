/**
 * Forgot password screen.
 * Sends a password reset email via Supabase.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { goBack } from '@/utils/navigation';
import { supabase } from '@/lib/supabase';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { TutorAvatar } from '@/components/TutorAvatar';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: 'learnova://reset-password' }
      );
      if (resetError) throw resetError;
      setSent(true);
    } catch {
      setError('Could not send reset email. Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack('/auth/sign-in')}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <TutorAvatar size={56} />

          <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('forgotPasswordSubtitle')}
          </Text>

          {!sent ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[
                    styles.input,
                    Platform.OS === 'web' && {
                      outlineStyle: 'none' as any,
                      outlineWidth: 0,
                    } as any,
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.resetBtn, isLoading && styles.resetBtnDisabled]}
                activeOpacity={0.75}
                onPress={handleReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetBtnText}>{t('forgotPasswordButton')} →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successEmoji}>📬</Text>
              <Text style={styles.successTitle}>{t('forgotPasswordSuccess')}</Text>
              <Text style={styles.successSub}>
                {t('forgotPasswordSuccess')}
                {'\n'}
                <Text style={styles.successEmail}>{email}</Text>
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                activeOpacity={0.75}
                onPress={() => router.replace('/auth/sign-in')}
              >
                <Text style={styles.resetBtnText}>{t('forgotPasswordBack')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.xl,
  },
  backBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 52,
  },
  inputIcon: { fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.error,
  },
  resetBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  resetBtnDisabled: { opacity: 0.4 },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  successBox: {
    alignItems: 'center',
    gap: SPACING.md,
    width: '100%',
  },
  successEmoji: { fontSize: 56 },
  successTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  successSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
});
