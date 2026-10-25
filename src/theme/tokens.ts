export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 20,
  xl: 24,
  pill: 999,
};

export const typography = {
  fontFamily: {
    regular: undefined,
    medium: undefined,
    bold: undefined,
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const lightColors = {
  background: '#F5F8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#E8F1FD',
  border: '#E4ECF9',
  textPrimary: '#0D1B3E',
  textSecondary: '#4A5568',
  textTertiary: '#667082',
  primary: '#1A73E8',
  primaryDark: '#0056D6',
  primaryLight: '#E8F1FD',
  primaryText: '#FFFFFF',
  success: '#00C48C',
  successText: '#00795E',
  danger: '#FF5A5F',
  dangerText: '#D92D38',
  warning: '#F5A623',
  warningText: '#A96500',
  income: '#00795E',
  expense: '#D92D38',
  telegram: '#229ED9',
  overlay: 'rgba(13,27,62,0.4)',
  focusRing: '#1A73E8',
  shadow: 'rgba(13,27,62,0.06)',
};

export const darkColors = {
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceAlt: '#1A2A4A',
  border: '#2A2F3E',
  textPrimary: '#E8EBF5',
  textSecondary: '#A8B2C8',
  textTertiary: '#7E8BA8',
  primary: '#1A73E8',
  primaryDark: '#0056D6',
  primaryLight: '#1A2A4A',
  primaryText: '#FFFFFF',
  success: '#3DDC97',
  successText: '#3DDC97',
  danger: '#FF7A7E',
  dangerText: '#FF7A7E',
  warning: '#F5B94A',
  warningText: '#F5B94A',
  income: '#3DDC97',
  expense: '#FF7A7E',
  telegram: '#229ED9',
  overlay: 'rgba(0,0,0,0.6)',
  focusRing: '#1A73E8',
  shadow: 'rgba(0,0,0,0.4)',
};

export type ThemeColors = typeof lightColors;

export const shadows = {
  sm: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0D1B3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
};

export type ThemeMode = 'light' | 'dark';
