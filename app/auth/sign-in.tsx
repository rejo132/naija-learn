/**
 * Sign in screen.
 * Parents enter email and password to access their account.
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants/theme';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { TutorAvatar } from '@/components/TutorAvatar';

WebBrowser.maybeCompleteAuthSession();

const FEATURES = [
  { emoji: '🧠', text: 'Claude AI Tutor' },
  { emoji: '📚', text: 'NERDC Curriculum' },
  { emoji: '🌍', text: '4 Nigerian Languages' },
  { emoji: '📊', text: 'Works Offline' },
  { emoji: '🏆', text: 'Gamified Learning' },
];

async function completeOAuthFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return;
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
  }
}

export default function SignInScreen() {
  const { width } = useWindowDimensions();
  const isWide = width > 768;

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, clearError } = useAuthStore();
  const { t, language } = useTranslation();
  const ui = getUIText(language);

  const redirectUri = makeRedirectUri({ scheme: 'learnova' });

  function validateEmail(value: string) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!value) {
      setEmailError('');
      setEmailValid(false);
    } else if (!valid) {
      setEmailError('Please enter a valid email address');
      setEmailValid(false);
    } else {
      setEmailError('');
      setEmailValid(true);
    }
  }

  async function handleSignIn() {
    if (authMode === 'phone') {
      setError('Phone sign-in is coming soon. Please use email.');
      return;
    }
    if (!email.trim() || !password.trim()) return;
    if (emailError) return;

    setIsLoading(true);
    setError('');
    clearError();
    try {
      await signIn(email.trim(), password);
      router.replace('/');
    } catch {
      setError('No account found. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      setError('');
      clearError();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) throw oauthError;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success' && result.url) {
          await completeOAuthFromUrl(result.url);
          router.replace('/dashboard');
        }
      }
    } catch {
      setError('Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMicrosoftSignIn() {
    try {
      setIsLoading(true);
      setError('');
      clearError();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          scopes: 'email',
        },
      });
      if (oauthError) throw oauthError;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success' && result.url) {
          await completeOAuthFromUrl(result.url);
          router.replace('/dashboard');
        }
      }
    } catch {
      setError('Microsoft sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {isWide && (
          <View style={styles.leftPanel}>
            <LinearGradient
              colors={['#1A0A2E', '#0D1F14', '#003D25']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />

            <View style={styles.leftLogo}>
              <TutorAvatar size={56} />
              <Text style={styles.leftAppName}>Learnova</Text>
            </View>

            <View style={styles.featuresList}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quoteBlock}>
              <Text style={styles.quoteText}>
                &quot;Education is the most powerful weapon&quot;
              </Text>
              <Text style={styles.quoteAuthor}>— Nelson Mandela</Text>
            </View>
          </View>
        )}

        <KeyboardAvoidingView
          style={styles.rightPanel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {!isWide && (
              <View style={styles.mobileLogo}>
                <TutorAvatar size={48} />
                <Text style={styles.mobileAppName}>Learnova</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.welcomeTitle}>{t('welcomeBackAuth')}</Text>
              <Text style={styles.welcomeSub}>{t('signInToContinue')}</Text>

              <View style={styles.authToggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, authMode === 'email' && styles.toggleBtnActive]}
                  onPress={() => setAuthMode('email')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      authMode === 'email' && styles.toggleBtnTextActive,
                    ]}
                  >
                    {ui.emailMode}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, authMode === 'phone' && styles.toggleBtnActive]}
                  onPress={() => setAuthMode('phone')}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      authMode === 'phone' && styles.toggleBtnTextActive,
                    ]}
                  >
                    {ui.phoneMode}
                  </Text>
                </TouchableOpacity>
              </View>

              {authMode === 'email' && (
                <>
                  <View
                    style={[
                      styles.inputGroup,
                      emailError
                        ? styles.inputGroupError
                        : emailValid
                          ? styles.inputGroupValid
                          : null,
                    ]}
                  >
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={COLORS.textMuted}
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        validateEmail(v);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                    {emailValid && <Text style={styles.inputValid}>✓</Text>}
                  </View>
                  {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('password')}
                      placeholderTextColor={COLORS.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                      <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {authMode === 'phone' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputIcon}>📱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0803 000 0000"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.formRow}>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setKeepSignedIn((k) => !k)}
                >
                  <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                    {keepSignedIn && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>{t('keepSignedIn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as never)}>
                  <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInBtn, isLoading && styles.signInBtnLoading]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInBtnText}>{t('signIn')} →</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.privacyNote}>{ui.privacyNote}</Text>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('orSignInWith')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.socialBtnText}>G  Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={handleMicrosoftSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.socialBtnText}>M  Microsoft</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.signUpLink}
                onPress={() => router.push('/auth/sign-up')}
              >
                <Text style={styles.signUpLinkText}>
                  {t('noAccount')}{' '}
                  <Text style={styles.signUpLinkBold}>{t('signUpFree')}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 55,
    position: 'relative',
    overflow: 'hidden',
    padding: SPACING.xxxl,
    justifyContent: 'space-between',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(100, 60, 180, 0.25)',
    top: -80,
    left: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 80, 40, 0.4)',
    bottom: 100,
    left: 80,
  },
  decorCircle3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(30, 60, 120, 0.3)',
    top: 200,
    right: -40,
  },
  leftLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  leftAppName: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  featuresList: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureEmoji: { fontSize: 22 },
  featureText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  rightPanel: {
    flex: 45,
    backgroundColor: '#FFFFFF',
  },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  mobileLogo: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  mobileAppName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
    gap: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    color: COLORS.textPrimary,
  },
  welcomeSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    marginTop: -SPACING.sm,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: { color: COLORS.primary },
  inputGroup: {
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
  inputGroupError: { borderColor: COLORS.error },
  inputGroupValid: { borderColor: COLORS.success },
  inputIcon: { fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  inputValid: {
    color: COLORS.success,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  eyeIcon: { fontSize: 18, padding: 4 },
  fieldError: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.error,
    marginTop: -SPACING.sm,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  checkLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textSecondary,
  },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.primary,
  },
  errorBanner: {
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
  signInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  signInBtnLoading: { opacity: 0.7 },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  privacyNote: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  socialBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.textPrimary,
  },
  signUpLink: { alignItems: 'center' },
  signUpLinkText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    color: COLORS.textMuted,
  },
  signUpLinkBold: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.primary,
  },
});
