import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacityProps,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'text';
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    loading = false,
    variant = 'primary',
    fullWidth = true,
    disabled = false,
    style,
    textStyle,
    onPress,
    ...restProps
}) => {
    const isInteractionDisabled = disabled || loading;

    const getContainerStyle = (): StyleProp<ViewStyle> => {
        return [
            styles.container,
            fullWidth ? styles.fullWidth : null,
            variant === 'primary' ? styles.primaryContainer : null,
            variant === 'secondary' ? styles.secondaryContainer : null,
            variant === 'outline' ? styles.outlineContainer : null,
            variant === 'text' ? styles.textContainer : null,
            disabled ? styles.disabledContainer : null,
            style,
        ];
    };

    const getTextStyle = (): StyleProp<TextStyle> => {
        return [
            styles.text,
            variant === 'primary' ? styles.primaryText : null,
            variant === 'secondary' ? styles.secondaryText : null,
            variant === 'outline' ? styles.outlineText : null,
            variant === 'text' ? styles.textVariantText : null,
            disabled ? styles.disabledText : null,
            textStyle,
        ];
    };

    const getSpinnerColor = (): string => {
        if (variant === 'outline' || variant === 'text') {
            return theme.colors.primary;
        }
        if (variant === 'secondary') {
            return theme.colors.secondary;
        }
        return theme.colors.textInverse;
    };

    return (
        <TouchableOpacity
            style={getContainerStyle()}
            onPress={onPress}
            disabled={isInteractionDisabled}
            activeOpacity={0.8}
            {...restProps}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getSpinnerColor()} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        flexDirection: 'row',
    },
    fullWidth: {
        width: '100%',
    },
    primaryContainer: {
        backgroundColor: theme.colors.primary,
    },
    secondaryContainer: {
        backgroundColor: theme.colors.secondaryLight,
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    textContainer: {
        backgroundColor: 'transparent',
        height: 'auto',
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
    },
    disabledContainer: {
        backgroundColor: theme.colors.surfaceVariant,
        borderColor: theme.colors.border,
    },
    text: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.semibold,
    },
    primaryText: {
        color: theme.colors.textInverse,
    },
    secondaryText: {
        color: theme.colors.secondary,
    },
    outlineText: {
        color: theme.colors.primary,
    },
    textVariantText: {
        color: theme.colors.primary,
    },
    disabledText: {
        color: theme.colors.textMuted,
    },
});
