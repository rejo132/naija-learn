/**
 * Banner shown at the top of the screen when the device
 * has no internet connection.
 * Only renders when offline — invisible when connected.
 */
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTranslation } from '@/hooks/useTranslation';
import { SPACING, FONT_SIZES, FONT_FAMILY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function OfflineBanner() {
  const { isConnected, isChecking } = useNetworkStatus();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  if (isChecking || isConnected) return null;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: isDarkMode ? '#3D3000' : '#FFF3CD' },
      ]}
    >
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.text}>
        {t('offlineBanner')} — {t('offlineBannerSub')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: { fontSize: FONT_SIZES.lg },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#856404',
    fontWeight: '600',
  },
});
