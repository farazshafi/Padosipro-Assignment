import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { theme } from '../../theme';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    containerStyle,
    inputStyle,
    secureTextEntry,
    onFocus,
    onBlur,
    ...restProps
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    const isSecure = secureTextEntry && !isPasswordVisible;

    return (
        <View style={[styles.container, containerStyle]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputFocused,
                    !!error && styles.inputError,
                ]}
            >
                <TextInput
                    style={[styles.input, inputStyle]}
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={isSecure}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...restProps}
                />

                {secureTextEntry ? (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.toggleText}>
                            {isPasswordVisible ? 'Hide' : 'Show'}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : helperText ? (
                <Text style={styles.helperText}>{helperText}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    label: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        height: 48,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    input: {
        flex: 1,
        fontSize: theme.typography.fontSizes.md,
        color: theme.colors.textPrimary,
        height: '100%',
    },
    toggleButton: {
        paddingLeft: theme.spacing.sm,
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primary,
    },
    errorText: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.error,
        marginTop: theme.spacing.xxs,
    },
    helperText: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xxs,
    },
});
