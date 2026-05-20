/**
 * Change Parent PIN screen (`/change-password`).
 *
 * Updates the 4-digit PIN that unlocks the Parent Zone (`ParentGate`).
 * This does NOT touch Supabase auth — only the local `parentPin` value
 * in the app store.
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
  Platform,
} from 'react-native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/appStore';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_FAMILY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function ChangePinScreen() {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const parentPin = useAppStore((s) => s.parentPin);
  const setParentPin = useAppStore((s) => s.setParentPin);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const newPinRef = useRef<TextInput | null>(null);
  const confirmPinRef = useRef<TextInput | null>(null);

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
    if (!currentPin.trim()) return 'Please enter your current PIN';
    if (currentPin !== parentPin) return 'Current PIN is incorrect';
    if (!newPin.trim()) return 'Please enter a new PIN';
    if (newPin.length !== 4) return 'PIN must be exactly 4 digits';
    if (!/^\d{4}$/.test(newPin)) return 'PIN must contain only numbers';
    if (newPin === currentPin)
      return 'New PIN must be different from current PIN';
    if (newPin !== confirmPin) return 'PINs do not match';
    return null;
  }

  async function handleChangePin() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 600));

    setParentPin(newPin);
    setIsLoading(false);
    setSuccess(true);

    setTimeout(() => router.back(), 2000);
  }

  const cardBg = colors.backgroundCard;
  const submitDisabled =
    isLoading ||
    currentPin.length < 4 ||
    newPin.length < 4 ||
    confirmPin.length < 4;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, backgroundColor: cardBg },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('changePinTitle')}
        </Text>
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
          <View style={[styles.successCard, { backgroundColor: cardBg }]}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={[styles.successTitle, { color: COLORS.success }]}>
              {t('changePinSuccess')}
            </Text>
            <Text
              style={[
                styles.successSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              {t('changePinSuccessMsg')}
            </Text>
          </View>
        ) : (
          <View style={[styles.formCard, { backgroundColor: cardBg }]}>
            <View style={{ marginBottom: SPACING.sm }}>
              <Lock size={56} color={colors.primary} />
            </View>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
              Change Parent Portal PIN
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
              This PIN protects the Parent Zone.{'\n'}
              {parentPin === '1234'
                ? 'Default PIN is 1234. Change it now to secure your Parent Zone.'
                : 'Your Parent Zone is protected with a custom PIN.'}
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity onPress={() => setError(null)}>
                  <Text style={styles.errorDismiss}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {t('changePinCurrent')}
            </Text>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  borderColor:
                    error && error.includes('current')
                      ? COLORS.error
                      : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={currentPin}
              onChangeText={(v) => {
                setCurrentPin(v.replace(/\D/g, '').slice(0, 4));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="• • • •"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
              onSubmitEditing={() => newPinRef.current?.focus()}
            />

            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {t('changePinNew')}
            </Text>
            <TextInput
              ref={newPinRef}
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={newPin}
              onChangeText={(v) => {
                setNewPin(v.replace(/\D/g, '').slice(0, 4));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="• • • •"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
              onSubmitEditing={() => confirmPinRef.current?.focus()}
            />

            {newPin.length > 0 && (
              <View style={styles.dotsRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          newPin.length >= i ? COLORS.primary : colors.border,
                      },
                    ]}
                  />
                ))}
                <Text style={[styles.dotsLabel, { color: colors.textMuted }]}>
                  {newPin.length}/4 digits
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: colors.textPrimary }]}>
              {t('changePinConfirm')}
            </Text>
            <TextInput
              ref={confirmPinRef}
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  borderColor:
                    confirmPin.length === 4
                      ? confirmPin === newPin
                        ? COLORS.success
                        : COLORS.error
                      : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={confirmPin}
              onChangeText={(v) => {
                setConfirmPin(v.replace(/\D/g, '').slice(0, 4));
                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="• • • •"
              placeholderTextColor={colors.textMuted}
              returnKeyType="go"
              onSubmitEditing={handleChangePin}
            />

            {confirmPin.length === 4 && (
              <Text
                style={[
                  styles.matchText,
                  {
                    color:
                      confirmPin === newPin ? COLORS.success : COLORS.error,
                  },
                ]}
              >
                {confirmPin === newPin
                  ? '✓ PINs match'
                  : '✗ PINs do not match'}
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                submitDisabled && styles.submitBtnDisabled,
              ]}
              activeOpacity={0.75}
              onPress={handleChangePin}
              disabled={submitDisabled}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>{t('changePinButton')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.75}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  formCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  formTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  errorBox: {
    width: '100%',
    backgroundColor: COLORS.errorLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
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
    width: '100%',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  pinInput: {
    width: '100%',
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
    letterSpacing: 16,
    ...(Platform.OS === 'web' && { outlineStyle: 'none', outlineWidth: 0 }),
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    marginTop: SPACING.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotsLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    marginLeft: SPACING.xs,
  },
  matchText: {
    width: '100%',
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-SemiBold',
    marginTop: SPACING.xs,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    minHeight: 52,
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  cancelBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  successCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  successEmoji: { fontSize: 64 },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
