import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, ErrorMessage, LoadingSpinner, BrandLogo } from '../../components/common';
import { apiClient, ApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
    const { email } = route.params || { email: '' };
    const { login } = useAuth();

    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Countdown timer effect
    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleDigitChange = (text: string, index: number) => {
        setApiError(null);
        setSuccessMessage(null);

        // Handle paste of full 6-digit code
        if (text.length > 1) {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
            const newDigits = Array(OTP_LENGTH).fill('');
            cleaned.split('').forEach((char, i) => {
                newDigits[i] = char;
            });
            setOtpDigits(newDigits);
            if (cleaned.length === OTP_LENGTH) {
                inputRefs.current[OTP_LENGTH - 1]?.focus();
            }
            return;
        }

        const cleanChar = text.replace(/[^0-9]/g, '');
        const newDigits = [...otpDigits];
        newDigits[index] = cleanChar;
        setOtpDigits(newDigits);

        // Auto-advance focus to next input
        if (cleanChar && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const otpCode = otpDigits.join('');
    const isCodeComplete = otpCode.length === OTP_LENGTH;

    const handleVerify = async () => {
        if (!isCodeComplete) {
            setApiError('Please enter all 6 digits of the OTP code');
            return;
        }

        setApiError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const response = await apiClient.post('/auth/verify-otp', {
                email,
                code: otpCode,
            }, { requiresAuth: false });

            if (response.success && response.data) {
                setSuccessMessage('Email verified successfully! Logging you in...');

                const authData = response.data;
                if (authData.token && authData.user) {
                    setTimeout(async () => {
                        await login(authData.token, {
                            id: authData.user.id,
                            email: authData.user.email,
                            fullName: '',
                            isVerified: true,
                            isProfileComplete: false,
                        });
                    }, 500);
                } else {
                    setTimeout(() => {
                        navigation.navigate('Login', {
                            message: 'Email verified successfully! Please sign in.',
                            email,
                        });
                    }, 1000);
                }
            } else {
                setApiError(response.message || 'OTP verification failed. Please try again.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Network error. Failed to reach verification server.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (cooldown > 0 || resending) return;

        setApiError(null);
        setSuccessMessage(null);
        setResending(true);

        try {
            const response = await apiClient.post('/auth/resend-otp', {
                email,
            }, { requiresAuth: false });

            if (response.success) {
                setSuccessMessage('A new 6-digit OTP code has been sent to your email.');
                setCooldown(RESEND_COOLDOWN_SECONDS);
                setOtpDigits(Array(OTP_LENGTH).fill(''));
                inputRefs.current[0]?.focus();
            } else {
                setApiError(response.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setApiError(err.message);
            } else {
                setApiError('Network connection error while requesting new OTP.');
            }
        } finally {
            setResending(false);
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
                    <BrandLogo size="md" showText style={styles.logoMargin} />
                    <Text style={styles.title}>Verify Email</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit verification code sent to{' '}
                        <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
                    </Text>
                </View>

                {apiError ? (
                    <ErrorMessage
                        title="Verification Failed"
                        message={apiError}
                        variant="card"
                        style={styles.alertCard}
                    />
                ) : null}

                {successMessage ? (
                    <View style={styles.successCard}>
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) : null}

                <View style={styles.otpRow}>
                    {otpDigits.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpBox,
                                digit ? styles.otpBoxFilled : null,
                                inputRefs.current[index]?.isFocused() ? styles.otpBoxFocused : null,
                            ]}
                            value={digit}
                            onChangeText={(text) => handleDigitChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={6}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                <Button
                    title="Verify OTP Code"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={!isCodeComplete || loading}
                    style={styles.verifyButton}
                />

                <View style={styles.resendContainer}>
                    <Text style={styles.resendInfo}>Didn't receive the code? </Text>
                    {resending ? (
                        <LoadingSpinner size="small" />
                    ) : (
                        <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={cooldown > 0}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.resendLink,
                                    cooldown > 0 && styles.resendDisabled,
                                ]}
                            >
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
    },
    logoMargin: {
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSizes.xxl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeights.sm,
        textAlign: 'center',
    },
    emailHighlight: {
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primary,
    },
    alertCard: {
        marginBottom: theme.spacing.md,
    },
    successCard: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    successText: {
        color: theme.colors.primary,
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.medium,
        textAlign: 'center',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    otpBox: {
        width: 46,
        height: 54,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        textAlign: 'center',
        fontSize: theme.typography.fontSizes.xl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
    },
    otpBoxFilled: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    otpBoxFocused: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    verifyButton: {
        marginBottom: theme.spacing.lg,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    resendInfo: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
    },
    resendLink: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primary,
    },
    resendDisabled: {
        color: theme.colors.textMuted,
    },
    backToLogin: {
        alignSelf: 'center',
        paddingVertical: theme.spacing.xs,
    },
    backToLoginText: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
    },
});
