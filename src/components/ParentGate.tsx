import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';

interface ParentGateProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ParentGate({ visible, onSuccess, onCancel }: ParentGateProps) {
  const { colors, isDarkMode } = useTheme();
  const parentPin = useAppStore((s) => s.parentPin);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (pin === parentPin) {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
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
          <Text style={styles.lockEmoji}>🔐</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Parent Area
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Enter your 4-digit PIN to continue
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
            onPress={handleSubmit}
            disabled={pin.length !== 4}
          >
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setPin('');
              setError('');
              onCancel();
            }}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Change your PIN in{' '}
            <Text style={{ color: colors.primary }}>
              Settings → Parent Zone
            </Text>
          </Text>
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
  lockEmoji: { fontSize: 48 },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  pinInput: {
    width: 160,
    textAlign: 'center',
    fontSize: FONT_SIZES.xxl,
    fontFamily: 'Poppins-Bold',
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    letterSpacing: 12,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Bold',
    fontSize: FONT_SIZES.md,
  },
  cancelBtn: { paddingVertical: SPACING.sm },
  cancelBtnText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Poppins-Regular',
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.6,
  },
});
