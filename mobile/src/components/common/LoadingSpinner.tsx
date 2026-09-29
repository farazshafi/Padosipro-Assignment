import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
    size?: 'small' | 'large';
    color?: string;
    style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message,
    fullScreen = false,
    size = 'large',
    color = theme.colors.primary,
    style,
}) => {
    return (
        <View
            style={[
                styles.container,
                fullScreen && styles.fullScreen,
                style,
            ]}
        >
            <ActivityIndicator size={size} color={color} />
            {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    message: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.typography.fontWeights.medium,
        textAlign: 'center',
    },
});
