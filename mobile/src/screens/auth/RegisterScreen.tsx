import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input, Button, ErrorMessage } from '../../components/common';
import { apiClient, ApiError } from '../../services/api';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState<FormErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    const validateField = (field: string, val: string, currentPassword = password): string | undefined => {
        if (field === 'email') {
            if (!val.trim()) return 'Email address is required';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val.trim())) return 'Please enter a valid email address';
        }

        if (field === 'password') {
            if (!val) return 'Password is required';
            if (val.length < 8) return 'Password must be at least 8 characters long';
            if (!/[A-Za-z]/.test(val) || !/[0-9]/.test(val)) {
                return 'Password must contain at least one letter and one number';
            }
        }

        if (field === 'confirmPassword') {
            if (!val) return 'Please confirm your password';
            if (val !== currentPassword) return 'Passwords do not match';
        }

        return undefined;
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        let err: string | undefined;
        if (field === 'email') err = validateField('email', email);
        if (field === 'password') err = validateField('password', password);
        if (field === 'confirmPassword') err = validateField('confirmPassword', confirmPassword, password);

        setErrors((prev) => ({ ...prev, [field]: err }));
    };

    const validateForm = (): boolean => {
        const emailErr = validateField('email', email);
        const passErr = validateField('password', password);
        const confirmErr = validateField('confirmPassword', confirmPassword, password);

        const newErrors: FormErrors = {
            email: emailErr,
            password: passErr,
            confirmPassword: confirmErr,
        };

        setErrors(newErrors);
        setTouched({ email: true, password: true, confirmPassword: true });

        return !emailErr && !passErr && !confirmErr;
    };

    const handleRegister = async () => {
        setApiError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/register', {
                email: email.trim().toLowerCase(),
                password,
                confirmPassword,
            }, { requiresAuth: false });

            if (response.success) {
                navigation.navigate('OTPVerification', { email: email.trim().toLowerCase() });
            } else {
                setApiError(response.message || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setApiError(err.message);
                if (err.errors && Array.isArray(err.errors)) {
                    const serverFieldErrors: FormErrors = {};
                    err.errors.forEach((e) => {
                        if (e.field === 'email') serverFieldErrors.email = e.message;
                        if (e.field === 'password') serverFieldErrors.password = e.message;
                        if (e.field === 'confirmPassword') serverFieldErrors.confirmPassword = e.message;
                    });
                    setErrors((prev) => ({ ...prev, ...serverFieldErrors }));
                }
            } else {
                setApiError('Network connection error. Please check your internet connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>
                        Join PadosiPro to get started with neighborhood lifestyle management
                    </Text>
                </View>

                {apiError ? (
                    <ErrorMessage
                        title="Registration Error"
                        message={apiError}
                        variant="card"
                        style={styles.errorCard}
                    />
                ) : null}

                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (touched.email) {
                                setErrors((prev) => ({ ...prev, email: validateField('email', text) }));
                            }
                        }}
                        onBlur={() => handleBlur('email')}
                        error={touched.email ? errors.email : undefined}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Input
                        label="Password"
                        placeholder="Minimum 8 characters (1 letter & 1 number)"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (touched.password) {
                                setErrors((prev) => ({ ...prev, password: validateField('password', text) }));
                            }
                            if (touched.confirmPassword && confirmPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    confirmPassword: validateField('confirmPassword', confirmPassword, text),
                                }));
                            }
                        }}
                        onBlur={() => handleBlur('password')}
                        error={touched.password ? errors.password : undefined}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Input
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (touched.confirmPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    confirmPassword: validateField('confirmPassword', text, password),
                                }));
                            }
                        }}
                        onBlur={() => handleBlur('confirmPassword')}
                        error={touched.confirmPassword ? errors.confirmPassword : undefined}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Register & Continue"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.linkText}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        flexGrow: 1,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.fontSizes.xxl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeights.sm,
    },
    errorCard: {
        marginBottom: theme.spacing.md,
    },
    form: {
        marginBottom: theme.spacing.lg,
    },
    submitButton: {
        marginTop: theme.spacing.sm,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    footerText: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
    },
    linkText: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primary,
    },
});
