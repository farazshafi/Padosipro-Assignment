export const typography = {
    fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    fontWeights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeights: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 28,
        xl: 30,
        xxl: 36,
        xxxl: 44,
    },
} as const;

export type Typography = typeof typography;
