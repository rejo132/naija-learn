/**
 * Sign up screen — child-first onboarding.
 * Step 1: account · Step 2: grade · Step 3: avatar → dashboard
 */
import { useEffect, useRef, useState } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_FAMILY } from '@/constants/theme';
import { getUIText } from '@/constants/languages';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { TutorAvatar } from '@/components/TutorAvatar';
import { supabase } from '@/lib/supabase';
import { syncProfile } from '@/services/dbService';
import { playSound } from '@/services/soundService';

const FEATURES = [
  { emoji: '🧠', text: 'Claude AI Tutor' },
  { emoji: '📚', text: 'NERDC Curriculum' },
  { emoji: '🌍', text: '4 Nigerian Languages' },
  { emoji: '📶', text: 'Works Offline' },
  { emoji: '🏆', text: 'Gamified Learning' },
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
const AVATAR_OPTIONS = ['🦁', '🐯', '🦊', '🐧', '🦅', '🐬'] as const;

type SignUpStep = 'account' | 'grade' | 'avatar';

function stepFromParam(stepParam: string | string[] | undefined): SignUpStep {
  const raw = Array.isArray(stepParam) ? stepParam[0] : stepParam;
  const n = raw ? parseInt(raw, 10) : 1;
  if (n === 2) return 'grade';
  if (n === 3) return 'avatar';
  return 'account';
}

export default function SignUpScreen() {
  const { step: stepParam } = useLocalSearchParams<{ step?: string }>();
  const { width } = useWindowDimensions();
  const isWide = width > 768;
  const { colors, isDarkMode } = useTheme();

  const [step, setStep] = useState<SignUpStep>(() => stepFromParam(stepParam));
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [selectedGradeNum, setSelectedGradeNum] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🦁');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signUp, error: storeError, clearError } = useAuthStore();
  const { t, language } = useTranslation();
  const ui = getUIText(language);

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const gradeScaleAnims = useRef(
    GRADE_OPTIONS.reduce(
      (acc, g) => {
        acc[g] = new Animated.Value(1);
        return acc;
      },
      {} as Record<number, Animated.Value>
    )
  ).current;

  const displayError = localError || storeError || '';

  useEffect(() => {
    if (stepParam) {
      setStep(stepFromParam(stepParam));
    }
  }, [stepParam]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        step === 'account' &&
        e.key === 'Enter' &&
        username.trim() &&
        email.trim() &&
        password.trim() &&
        !isLoading
      ) {
        handleAccountSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, email, password, isLoading, step]);

  function validateEmail(value: string) {
    if (!value) {
      setEmailError('');
      setEmailValid(false);
      return;
    }
    if (!value.includes('@') || !value.includes('.')) {
      setEmailError('Please enter a valid email address');
      setEmailValid(false);
      return;
    }
    setEmailError('');
    setEmailValid(true);
  }

  function validatePassword(value: string) {
    if (!value) {
      setPasswordError('');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  }

  async function handleAccountSubmit() {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !email.trim() || !password.trim()) return;

    if (!trimmedUsername) {
      setUsernameError('Please choose a username');
      return;
    }
    if (trimmedUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setUsernameError(
        'Username can only have letters, numbers, and underscores'
      );
      return;
    }

    validateEmail(email.trim());
    const passwordOk = validatePassword(password);
    if (!email.includes('@') || !email.includes('.') || emailError) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!passwordOk) {
      return;
    }

    setIsLoading(true);
    setLocalError('');
    clearError();
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .ilike('name', trimmedUsername)
        .maybeSingle();

      if (existing) {
        setUsernameError(
          'That username is already taken. Try another one!'
        );
        setIsLoading(false);
        return;
      }

      await signUp(email.trim(), password, trimmedUsername, '');
      useAppStore.getState().setUserName(trimmedUsername);
      setStep('grade');
    } catch {
      // error shown via displayError
    } finally {
      setIsLoading(false);
    }
  }

  function handleGradePick(grade: number) {
    setSelectedGradeNum(grade);
    setStep('avatar');
  }

  function handleGradePress(g: number) {
    Animated.sequence([
      Animated.timing(gradeScaleAnims[g], {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(gradeScaleAnims[g], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      playSound('tap');
      handleGradePick(g);
    });
  }

  async function handleFinish() {
    if (selectedGradeNum === null) return;

    setIsLoading(true);
    setLocalError('');

    try {
      useAppStore.getState().setGrade(selectedGradeNum);
      useAppStore.setState({
        userName: username.trim(),
        userAvatar: selectedAvatar,
        userGrade: `Primary ${selectedGradeNum}`,
        setupComplete: true,
      });

      try {
        await syncProfile({
          name: username.trim(),
          grade: selectedGradeNum,
          avatar: selectedAvatar,
          xp: 0,
          streak: 0,
          language: 'en',
          personality_id: 'aunty_naija',
          last_active_date: new Date().toISOString().split('T')[0],
          role: 'student',
        });
      } catch {
        // Non-blocking — proceed anyway
      }

      router.replace('/dashboard');
    } catch {
      setLocalError('Could not save your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmitAccount =
    username.trim().length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(username.trim()) &&
    email.trim() &&
    email.includes('@') &&
    email.includes('.') &&
    password.length >= 6 &&
    !emailError &&
    !passwordError &&
    !isLoading;

  const cardBg = isDarkMode ? colors.backgroundCard : '#FFFFFF';
  const inputBg = isDarkMode ? colors.background : COLORS.background;

  function renderAccountStep() {
    return (
      <>
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
          {ui.createAccount}
        </Text>
        <Text style={[styles.stepSub, { color: colors.textMuted }]}>
          {ui.joinStudents}
        </Text>

        {displayError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {displayError}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.inputGroup,
            { backgroundColor: inputBg, borderColor: usernameError ? '#E53935' : colors.border },
          ]}
        >
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={[
              styles.input,
              { color: colors.textPrimary },
              Platform.OS === 'web' && {
                outlineStyle: 'none' as any,
                outlineWidth: 0,
              } as any,
            ]}
            placeholder="Choose a username"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={(v) => {
              setUsername(v);
              setUsernameError('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </View>
        {usernameError ? <Text style={styles.fieldError}>{usernameError}</Text> : null}

        <View
          style={[
            styles.inputGroup,
            { backgroundColor: inputBg, borderColor: colors.border },
            emailError ? styles.inputGroupError : emailValid ? styles.inputGroupValid : null,
          ]}
        >
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            ref={emailRef}
            style={[
              styles.input,
              { color: colors.textPrimary },
              Platform.OS === 'web' && {
                outlineStyle: 'none' as any,
                outlineWidth: 0,
              } as any,
            ]}
            placeholder="name@example.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              validateEmail(v);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {emailValid && <Text style={styles.inputValid}>✓</Text>}
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        {/* Password field */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderRadius: 12,
          borderColor: passwordError
            ? '#E53935' : '#CCCCCC',
          backgroundColor: '#FFFFFF',
          paddingLeft: 12,
          paddingRight: 4,
          marginBottom: 4,
        }}>
          <Text style={{
            fontSize: 18,
            marginRight: 8,
            color: '#666666',
          }}>🔒</Text>
          <TextInput
            ref={passwordRef}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#111111',
              paddingVertical: 14,
            }}
            placeholder="Create a password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (typeof setPasswordError
                === 'function')
                setPasswordError('');
              validatePassword(t);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (canSubmitAccount) handleAccountSubmit();
            }}
          />
          <TouchableOpacity
            onPress={() =>
              setShowPassword(prev => !prev)}
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            hitSlop={{
              top: 8, bottom: 8,
              left: 8, right: 8,
            }}
          >
            <Text style={{
              fontSize: 22,
              color: '#666666',
            }}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary },
            (isLoading || !canSubmitAccount) && styles.primaryBtnDisabled,
          ]}
          onPress={handleAccountSubmit}
          disabled={!canSubmitAccount}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Let&apos;s Go →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={[styles.signInLinkText, { color: colors.textMuted }]}>
            {ui.alreadyHaveAccount}{' '}
            <Text style={[styles.signInLinkBold, { color: colors.primary }]}>
              {ui.signInLink}
            </Text>
          </Text>
        </TouchableOpacity>
      </>
    );
  }

  function renderStepBack(onPress: () => void) {
    return (
      <TouchableOpacity onPress={onPress} style={{ padding: SPACING.md, alignSelf: 'flex-start' }}>
        <Text style={{ fontSize: 22, color: colors.textMuted }}>←</Text>
      </TouchableOpacity>
    );
  }

  function renderGradeStep() {
    return (
      <>
        {renderStepBack(() => setStep('account'))}
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
          What grade are you in?
        </Text>
        <Text style={[styles.stepSub, { color: colors.textMuted }]}>
          Tap your class to continue
        </Text>

        <View style={styles.gradeGrid}>
          {GRADE_OPTIONS.map((g) => {
            const active = selectedGradeNum === g;
            return (
              <Animated.View
                key={g}
                style={{ transform: [{ scale: gradeScaleAnims[g] }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.gradeCard,
                    {
                      backgroundColor: active ? colors.primaryLight : inputBg,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleGradePress(g)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.gradeEmoji}>📚</Text>
                  <Text
                    style={[
                      styles.gradeLabel,
                      { color: active ? colors.primaryDark : colors.textPrimary },
                    ]}
                  >
                    Primary {g}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </>
    );
  }

  function renderAvatarStep() {
    return (
      <>
        {renderStepBack(() => setStep('grade'))}
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
          Pick your avatar!
        </Text>
        <Text style={[styles.stepSub, { color: colors.textMuted }]}>
          Choose the one that feels like you
        </Text>

        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((emoji) => {
            const active = selectedAvatar === emoji;
            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.avatarCard,
                  {
                    backgroundColor: active ? colors.primaryLight : inputBg,
                    borderColor: active ? colors.primary : colors.border,
                  },
                  active && styles.avatarCardActive,
                ]}
                onPress={() => {
                  playSound('tap');
                  setSelectedAvatar(emoji);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary },
            isLoading && styles.primaryBtnDisabled,
          ]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Start Learning →</Text>
          )}
        </TouchableOpacity>
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
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
          style={[styles.rightPanel, { backgroundColor: colors.background }]}
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
                <Text style={[styles.mobileAppName, { color: colors.primary }]}>
                  Learnova
                </Text>
              </View>
            )}

            <View style={styles.stepDots}>
              {(['account', 'grade', 'avatar'] as SignUpStep[]).map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        step === s ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            <View style={[styles.card, { backgroundColor: cardBg, borderColor: colors.border }]}>
              {step === 'account' && renderAccountStep()}
              {step === 'grade' && renderGradeStep()}
              {step === 'avatar' && renderAvatarStep()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, flexDirection: 'row' },
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
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  rightPanel: { flex: 45 },
  formScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  mobileLogo: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  mobileAppName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  stepSub: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    minHeight: 52,
  },
  inputGroupError: { borderColor: COLORS.error },
  inputGroupValid: { borderColor: COLORS.success },
  passwordGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    minHeight: 52,
    gap: SPACING.sm,
  },
  inputIcon: { fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: SPACING.md,
  },
  inputValid: {
    color: COLORS.success,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 18 },
  fieldError: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: -SPACING.sm,
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
    color: COLORS.error,
  },
  primaryBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  signInLink: { alignItems: 'center', marginTop: SPACING.sm },
  signInLinkText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  signInLinkBold: {
    fontFamily: 'Poppins-Bold',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  gradeCard: {
    width: '46%',
    minWidth: 140,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gradeEmoji: { fontSize: 28 },
  gradeLabel: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Bold',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarCard: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCardActive: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  avatarEmoji: { fontSize: 40 },
});
