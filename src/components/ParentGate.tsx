import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/appStore';

interface ParentGateProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParentGate({ visible, onSuccess, onCancel }: ParentGateProps) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const parentPin = useAppStore((s) => s.parentPin);
  const hasSetupParentPin = useAppStore((s) => s.hasSetupParentPin);
  const setHasSetupParentPin = useAppStore((s) => s.setHasSetupParentPin);
  const setParentPin = useAppStore((s) => s.setParentPin);

  const [isSettingUp, setIsSettingUp] = useState(!hasSetupParentPin);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    if (visible) {
      setIsSettingUp(!hasSetupParentPin);
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSetupError('');
    }
  }, [visible, hasSetupParentPin]);

  function handleSubmit() {
    if (pin === parentPin) {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError(t('parentGateWrong'));
      setPin('');
    }
  }

  function handleSetPin() {
    if (newPin.length !== 4) {
      setSetupError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setSetupError('PINs do not match');
      return;
    }
    setParentPin(newPin);
    setHasSetupParentPin(true);
    setIsSettingUp(false);
    setNewPin('');
    setConfirmPin('');
    setSetupError('');
    onSuccess();
  }

  function handleCancel() {
    setPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setSetupError('');
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? '#1A2420' : '#FFFFFF' },
          ]}
        >
          <ShieldCheck size={48} color={colors.primary} />

          {isSettingUp ? (
            <>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {t('parentGateSetupTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {t('parentGateSetupSubtitle')}
              </Text>

              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                {t('changePinNew')}
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    color: colors.textPrimary,
                    borderColor: setupError ? COLORS.error : colors.border,
                    backgroundColor: isDarkMode ? '#0F1512' : COLORS.background,
                  },
                ]}
                value={newPin}
                onChangeText={(v) => {
                  setNewPin(v.replace(/\D/g, '').slice(0, 4));
                  setSetupError('');
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                {t('changePinConfirm')}
              </Text>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    color: colors.textPrimary,
                    borderColor: setupError ? COLORS.error : colors.border,
                    backgroundColor: isDarkMode ? '#0F1512' : COLORS.background,
                  },
                ]}
                value={confirmPin}
                onChangeText={(v) => {
                  setConfirmPin(v.replace(/\D/g, '').slice(0, 4));
                  setSetupError('');
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={handleSetPin}
              />

              {setupError ? <Text style={styles.errorText}>{setupError}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (newPin.length !== 4 || confirmPin.length !== 4) &&
                    styles.confirmBtnDisabled,
                ]}
                activeOpacity={0.75}
                onPress={handleSetPin}
                disabled={newPin.length !== 4 || confirmPin.length !== 4}
              >
                <Text style={styles.confirmBtnText}>{t('parentGateSetPIN')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.75}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {t('parentGateTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {t('parentGateSubtitle')}
              </Text>

              <TextInput
                style={[
                  styles.pinInput,
                  {
                    color: colors.textPrimary,
                    borderColor: error ? COLORS.error : colors.border,
                    backgroundColor: isDarkMode ? '#0F1512' : COLORS.background,
                  },
                ]}
                value={pin}
                onChangeText={(v) => {
                  setPin(v);
                  setError('');
                }}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={handleSubmit}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.confirmBtn, pin.length !== 4 && styles.confirmBtnDisabled]}
                activeOpacity={0.75}
                onPress={handleSubmit}
                disabled={pin.length !== 4}
              >
                <Text style={styles.confirmBtnText}>{t('confirm')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.75}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.hint, { color: colors.textMuted }]}>
                {t('parentGateHint')}
              </Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONT_FAMILY.bold,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: SPACING.xs,
  },
  pinInput: {
    width: 160,
    textAlign: 'center',
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONT_FAMILY.bold,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    letterSpacing: 12,
    ...(Platform.OS === 'web' && { outlineStyle: 'none', outlineWidth: 0 }),
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.error,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: {
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZES.md,
  },
  cancelBtn: { paddingVertical: SPACING.sm },
  cancelBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.regular,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.6,
  },
});
