/**
 * Learnova Design System
 * Elevated glassmorphism with Nigerian warmth
 */

export const COLORS = {
  // Primary greens — Nigerian flag inspired
  primary: '#008751',
  primaryDark: '#005C36',
  primaryLight: '#E8F5EE',
  primaryGlow: 'rgba(0, 135, 81, 0.15)',

  // Accent colors
  accent: '#F5A623',
  accentLight: '#FFF8E7',
  accentDark: '#C17B00',

  // Backgrounds — layered depth
  background: '#F0FAF4',
  backgroundDeep: '#E4F5EB',
  backgroundCard: 'rgba(255, 255, 255, 0.82)',
  backgroundGlass: 'rgba(255, 255, 255, 0.65)',
  backgroundDark: 'rgba(0, 87, 51, 0.06)',

  // Text hierarchy
  textPrimary: '#0D2B1A',
  textSecondary: '#3D6B52',
  textMuted: '#8BAD98',
  textInverse: '#FFFFFF',

  // Semantic colors
  success: '#00A651',
  successLight: '#E6F9EE',
  warning: '#F5A623',
  warningLight: '#FFF8E7',
  error: '#E53935',
  errorLight: '#FFEBEE',

  // Glassmorphism
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  glassShimmer: 'rgba(255, 255, 255, 0.4)',
  glassShadow: 'rgba(0, 87, 51, 0.12)',

  // Nigerian flag
  flagGreen: '#008751',
  flagWhite: '#FFFFFF',

  // Gamification
  xpGold: '#F5A623',
  streakRed: '#FF4444',
  levelPurple: '#7C3AED',

  // Legacy (keep for compatibility)
  white: '#FFFFFF',
  card: '#FFFFFF',
  border: 'rgba(0, 135, 81, 0.15)',
  shadow: 'rgba(0, 87, 51, 0.12)',
};

export const FONTS = {
  regular: 'Poppins-Regular',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  // Fallbacks
  system: 'System',
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

export const GRADIENTS = {
  primary: ['#008751', '#00A651'],
  primaryDeep: ['#005C36', '#008751'],
  warm: ['#F5A623', '#FFD166'],
  background: ['#F0FAF4', '#E4F5EB'],
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)'],
  hero: ['#E8F5EE', '#F0FAF4'],
};
