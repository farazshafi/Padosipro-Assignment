export const colors = {
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryLight: '#DCFCE7',

    secondary: '#2563EB',
    secondaryDark: '#1D4ED8',
    secondaryLight: '#DBEAFE',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    border: '#E2E8F0',
    borderFocused: '#16A34A',

    error: '#EF4444',
    errorLight: '#FEE2E2',

    warning: '#F59E0B',
    warningLight: '#FEF3C7',

    success: '#10B981',
    successLight: '#D1FAE5',

    info: '#3B82F6',
    infoLight: '#EFF6FF',

    transparent: 'transparent',
} as const;

export type Colors = typeof colors;
