import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'default',
    style,
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    bg: theme.colors.successLight,
                    text: theme.colors.success,
                };
            case 'warning':
                return {
                    bg: theme.colors.warningLight,
                    text: theme.colors.warning,
                };
            case 'error':
                return {
                    bg: theme.colors.errorLight,
                    text: theme.colors.error,
                };
            case 'info':
                return {
                    bg: theme.colors.infoLight,
                    text: theme.colors.info,
                };
            case 'default':
            default:
                return {
                    bg: theme.colors.surfaceVariant,
                    text: theme.colors.textSecondary,
                };
        }
    };

    const colors = getVariantStyles();

    return (
        <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radius.full,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
    },
});
