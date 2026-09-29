import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface ErrorMessageProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    retryText?: string;
    variant?: 'banner' | 'card' | 'inline';
    style?: ViewStyle;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    title = 'Something went wrong',
    message,
    onRetry,
    retryText = 'Try Again',
    variant = 'card',
    style,
}) => {
    if (variant === 'inline') {
        return (
            <Text style={[styles.inlineText, style]}>{message}</Text>
        );
    }

    return (
        <View
            style={[
                styles.container,
                variant === 'banner' ? styles.bannerContainer : styles.cardContainer,
                style,
            ]}
        >
            <View style={styles.textContainer}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                <Text style={styles.message}>{message}</Text>
            </View>

            {onRetry ? (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={onRetry}
                    activeOpacity={0.7}
                >
                    <Text style={styles.retryText}>{retryText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginVertical: theme.spacing.sm,
    },
    cardContainer: {
        backgroundColor: theme.colors.errorLight,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    bannerContainer: {
        backgroundColor: theme.colors.error,
        borderRadius: theme.radius.none,
    },
    textContainer: {
        flexShrink: 1,
    },
    title: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.error,
        marginBottom: theme.spacing.xxs,
    },
    message: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textPrimary,
    },
    inlineText: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
    },
    retryButton: {
        marginTop: theme.spacing.sm,
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.error,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
    },
    retryText: {
        color: theme.colors.textInverse,
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
    },
});
