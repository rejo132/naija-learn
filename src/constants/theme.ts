/**
 * Learnova Design System
 * Elevated glassmorphism with Nigerian warmth
 */

export const COLORS = {
  // ── Primary brand (Nigerian green) ──
  primary: '#008751',
  primaryDark: '#005C36',
  primaryDeep: '#003D25',
  primaryLight: '#E8F5EE',
  primaryGlow: 'rgba(0, 135, 81, 0.12)',

  // ── Warm accent (Terracotta) ──
  accent: '#C2502A',
  accentLight: '#FDF0EB',
  accentMid: '#E8835A',
  accentDark: '#8B3518',

  // ── Gold (XP / rewards only) ──
  gold: '#EAA221',
  goldLight: '#FEF6E4',
  goldDark: '#B87B0A',

  // ── Backgrounds ──
  background: '#F9F6F0',
  backgroundDeep: '#F2EDE4',
  backgroundCard: '#FFFFFF',
  backgroundGlass: 'rgba(255, 255, 255, 0.80)',
  backgroundDark: 'rgba(26, 26, 26, 0.04)',

  // ── Text ──
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#9A9A9A',
  textInverse: '#FFFFFF',
  textAccent: '#C2502A',

  // ── Borders & glass ──
  border: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.75)',
  glassShadow: 'rgba(0, 0, 0, 0.06)',

  // ── Semantic ──
  success: '#008751',
  successLight: '#E8F5EE',
  warning: '#EAA221',
  warningLight: '#FEF6E4',
  error: '#D93025',
  errorLight: '#FDECEA',

  // ── Gamification ──
  xpGold: '#EAA221',
  streakRed: '#E53935',
  levelPurple: '#6B3FA0',

  // ── Legacy aliases (keep for compatibility) ──
  white: '#FFFFFF',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.06)',

  // ── Old names remapped (so nothing breaks) ──
  flagGreen: '#008751',
  flagWhite: '#FFFFFF',
};

export const DARK_COLORS = {
  // Primary
  primary: '#00C870',
  primaryDark: '#00A651',
  primaryDeep: '#008751',
  primaryLight: 'rgba(0, 200, 112, 0.12)',
  primaryGlow: 'rgba(0, 200, 112, 0.15)',

  // Warm accent
  accent: '#E8835A',
  accentLight: 'rgba(232, 131, 90, 0.15)',
  accentMid: '#C2502A',
  accentDark: '#FDF0EB',

  // Gold
  gold: '#F5C842',
  goldLight: 'rgba(245, 200, 66, 0.15)',
  goldDark: '#EAA221',

  // Backgrounds
  background: '#0F1512',
  backgroundDeep: '#0A0F0C',
  backgroundCard: '#1A2420',
  backgroundGlass: 'rgba(255, 255, 255, 0.05)',
  backgroundDark: 'rgba(0, 0, 0, 0.3)',

  // Text
  textPrimary: '#F0F7F4',
  textSecondary: '#A0B8AC',
  textMuted: '#5A7A6A',
  textInverse: '#0F1512',
  textAccent: '#E8835A',

  // Borders & glass
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassShadow: 'rgba(0, 0, 0, 0.3)',

  // Semantic
  success: '#00C870',
  successLight: 'rgba(0, 200, 112, 0.12)',
  warning: '#F5C842',
  warningLight: 'rgba(245, 200, 66, 0.12)',
  error: '#FF5252',
  errorLight: 'rgba(255, 82, 82, 0.12)',

  // Gamification
  xpGold: '#F5C842',
  streakRed: '#FF5252',
  levelPurple: '#9B72CF',

  // Legacy aliases
  white: '#F0F7F4',
  card: '#1A2420',
  shadow: 'rgba(0, 0, 0, 0.4)',
  flagGreen: '#00C870',
  flagWhite: '#F0F7F4',
};

export const FONTS = {
  regular: 'Poppins-Regular',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  // Fallbacks
  system: 'System',
};

export const FONT_FAMILY = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-SemiBold',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
  display: 48,
  hero: 64,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#005C36',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
  medium: {
    shadowColor: '#005C36',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 6,
  },
  strong: {
    shadowColor: '#005C36',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 40,
    elevation: 12,
  },
  glow: {
    shadowColor: '#008751',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
};

export const DARK_SHADOWS = {
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  strong: {
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 40,
    elevation: 16,
  },
  glow: {
    shadowColor: '#00C870',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
};

export const GRADIENTS = {
  primary: ['#008751', '#00A651'],
  primaryDeep: ['#003D25', '#008751'],
  warm: ['#C2502A', '#E8835A'],
  warmSoft: ['#FDF0EB', '#F9F6F0'],
  gold: ['#EAA221', '#F5C842'],
  background: ['#F9F6F0', '#F2EDE4'],
  glass: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.70)'],
  hero: ['#E8F5EE', '#F9F6F0'],
  sidebar: ['#1A2E20', '#0D1F14'],
};
