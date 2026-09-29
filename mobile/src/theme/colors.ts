export const colors = {
    // Primary Vibrant Emerald / Neon Green (Matching PadosiPro Reference UI)
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',

    secondary: '#34D399',
    secondaryDark: '#10B981',
    secondaryLight: 'rgba(52, 211, 153, 0.15)',

    // Dark Obsidian Theme Colors
    background: '#0A0D0C',
    surface: '#131816',
    surfaceVariant: '#1A221E',

    // Text Hierarchy for Dark Background
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textInverse: '#0A0D0C',

    // Glowing Dark Borders
    border: '#24302A',
    borderFocused: '#10B981',

    // Alert & Status Colors
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.18)',

    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.18)',

    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.18)',

    info: '#3B82F6',
    infoLight: 'rgba(59, 130, 246, 0.18)',

    transparent: 'transparent',
} as const;

export type Colors = typeof colors;
