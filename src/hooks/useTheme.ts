/**
 * Returns the correct color palette and shadows
 * based on the current dark/light mode setting.
 * Import this hook instead of importing COLORS directly
 * in screen components.
 */
import { useAppStore } from '@/store/appStore';
import { COLORS, DARK_COLORS, SHADOWS, DARK_SHADOWS } from '@/constants/theme';

export function useTheme() {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const colors = isDarkMode ? DARK_COLORS : COLORS;
  return {
    isDarkMode,
    toggleDarkMode,
    colors,
    shadows: isDarkMode ? DARK_SHADOWS : SHADOWS,
  };
}
