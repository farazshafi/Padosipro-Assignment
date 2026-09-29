import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ route, navigation }) => {
    const { login } = useAuth();

    const prefilledEmail = route.params?.email || '';
    const successNotice = route.params?.message || null;

    const [email, setEmail] = useState(prefilledEmail);
    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState<string | undefined>(undefined);
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isUnverified, setIsUnverified] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        }
    }, [route.params?.email]);

    const validateForm = (): boolean => {
        let valid = true;

        if (!email.trim()) {
            setEmailError('Email address is required');
            valid = false;
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                setEmailError('Please enter a valid email address');
                valid = false;
            } else {
                setEmailError(undefined);
            }
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else {
            setPasswordError(undefined);
        }

        return valid;
    };

    const handleLogin = async () => {
        setApiError(null);
        setIsUnverified(false);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await apiClient.post('/auth/login', {
                email: email.trim().toLowerCase(),
                password,
            }, { requiresAuth: false });

            if (response.success && response.data?.token) {
                const { token, user } = response.data;
                // Save persistent session in AuthContext & AsyncStorage
                await login(token, user);
            } else {
                setApiError(response.message || 'Login failed. Please try again.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setApiError(err.message);
                if (err.status === 403 && err.message.toLowerCase().includes('verified')) {
                    setIsUnverified(true);
                }
            } else {
                setApiError('Network connection error. Please check backend API connectivity.');
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
                    <Text style={styles.title}>PadosiPro</Text>
                    <Text style={styles.subtitle}>
                        Sign in to manage your household requests & tasks
                    </Text>
                </View>

                {successNotice ? (
                    <View style={styles.successBanner}>
                        <Text style={styles.successText}>{successNotice}</Text>
                    </View>
                ) : null}

                {apiError ? (
                    <ErrorMessage
                        title="Login Failed"
                        message={apiError}
                        variant="card"
                        style={styles.errorCard}
                    />
                ) : null}

                {isUnverified ? (
                    <TouchableOpacity
                        style={styles.unverifiedBanner}
                        onPress={() =>
                            navigation.navigate('OTPVerification', { email: email.trim().toLowerCase() })
                        }
                        activeOpacity={0.8}
                    >
                        <Text style={styles.unverifiedText}>
                            Account not verified. Tap here to enter verification OTP code.
                        </Text>
                    </TouchableOpacity>
                ) : null}

                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError(undefined);
                        }}
                        error={emailError}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError(undefined);
                        }}
                        error={passwordError}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.linkText}>Register</Text>
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
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeights.sm,
    },
    successBanner: {
        backgroundColor: theme.colors.successLight,
        borderColor: theme.colors.success,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    successText: {
        color: theme.colors.success,
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.medium,
    },
    errorCard: {
        marginBottom: theme.spacing.md,
    },
    unverifiedBanner: {
        backgroundColor: theme.colors.warningLight,
        borderColor: theme.colors.warning,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    unverifiedText: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
    },
    form: {
        marginBottom: theme.spacing.lg,
    },
    loginButton: {
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
