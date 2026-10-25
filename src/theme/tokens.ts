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
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  border: '#E4E7EB',
  textPrimary: '#14181F',
  textSecondary: '#6B7280',
  textTertiary: '#9AA1AC',
  primary: '#4C6FFF',
  primaryText: '#FFFFFF',
  success: '#1FAA59',
  danger: '#E5484D',
  warning: '#E8A33D',
  income: '#1FAA59',
  expense: '#E5484D',
  overlay: 'rgba(14,18,24,0.45)',
  focusRing: '#4C6FFF',
  shadow: 'rgba(16,24,40,0.08)',
};

export const darkColors = {
  background: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1E232B',
  border: '#2A2F38',
  textPrimary: '#F4F6F8',
  textSecondary: '#A7AEBB',
  textTertiary: '#767E8C',
  primary: '#6E8CFF',
  primaryText: '#0E1116',
  success: '#3FCB7A',
  danger: '#FF6B6F',
  warning: '#F0B957',
  income: '#3FCB7A',
  expense: '#FF6B6F',
  overlay: 'rgba(0,0,0,0.6)',
  focusRing: '#6E8CFF',
  shadow: 'rgba(0,0,0,0.4)',
};

export type ThemeColors = typeof lightColors;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};

export type ThemeMode = 'light' | 'dark';
