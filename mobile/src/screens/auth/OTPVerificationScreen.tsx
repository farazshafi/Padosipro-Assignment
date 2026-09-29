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
const EXPIRY_SECONDS = 120; // 2 minutes strict OTP expiration

export const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
    const { email } = route.params || { email: '' };
    const { login } = useAuth();

    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
    const [expiryTimeLeft, setExpiryTimeLeft] = useState(EXPIRY_SECONDS);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    // 1. Resend Cooldown Timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // 2. OTP Expiration Countdown Timer
    useEffect(() => {
        if (expiryTimeLeft <= 0) return;
        const timer = setInterval(() => {
            setExpiryTimeLeft((prev) => {
                if (prev <= 1) {
                    setApiError('OTP code has expired. Please request a new verification code.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [expiryTimeLeft]);

    const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isExpired = expiryTimeLeft <= 0;

    const handleDigitChange = (text: string, index: number) => {
        setApiError(null);
        setSuccessMessage(null);

        if (isExpired) {
            setApiError('OTP code has expired. Please request a new verification code.');
            return;
        }

        // Handle paste of full 6-digit code
        if (text.length > 1) {
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
            const newDigits = Array(OTP_LENGTH).fill('');
            cleaned.split('').forEach((char, i) => {
                newDigits[i] = char;
            });
            setOtpDigits(newDigits);
            const focusTarget = Math.min(cleaned.length, OTP_LENGTH - 1);
            inputRefs.current[focusTarget]?.focus();
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
        if (e.nativeEvent.key === 'Backspace') {
            if (!otpDigits[index] && index > 0) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = '';
                setOtpDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const otpCode = otpDigits.join('');
    const isCodeComplete = otpCode.length === OTP_LENGTH;

    const handleVerify = async () => {
        if (isExpired) {
            setApiError('OTP code has expired. Please request a new verification code.');
            return;
        }

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
                setExpiryTimeLeft(EXPIRY_SECONDS);
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

                {/* Expiration Timer Banner */}
                <View style={[styles.timerBanner, isExpired ? styles.timerBannerExpired : null]}>
                    <Text style={styles.timerLabel}>
                        {isExpired ? 'OTP Expired' : 'Code Expires In:'}
                    </Text>
                    <Text style={[styles.timerValue, isExpired ? styles.timerValueExpired : null]}>
                        {formatTime(expiryTimeLeft)}
                    </Text>
                </View>

                {apiError ? (
                    <ErrorMessage
                        title="Verification Error"
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
                    {otpDigits.map((digit, index) => {
                        const isFocused = focusedIndex === index;
                        return (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[
                                    styles.otpBox,
                                    digit ? styles.otpBoxFilled : null,
                                    isFocused ? styles.otpBoxFocused : null,
                                    isExpired ? styles.otpBoxDisabled : null,
                                ]}
                                value={digit}
                                onChangeText={(text) => handleDigitChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={() => setFocusedIndex(null)}
                                keyboardType="number-pad"
                                maxLength={index === 0 ? 6 : 1}
                                selectTextOnFocus
                                editable={!isExpired && !loading}
                            />
                        );
                    })}
                </View>

                <Button
                    title={isExpired ? 'OTP Expired' : 'Verify OTP Code'}
                    onPress={handleVerify}
                    loading={loading}
                    disabled={!isCodeComplete || loading || isExpired}
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
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Now'}
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
        marginBottom: theme.spacing.md,
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
    timerBanner: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        alignSelf: 'center',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    timerBannerExpired: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    timerLabel: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textSecondary,
        fontWeight: theme.typography.fontWeights.medium,
    },
    timerValue: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeights.bold,
    },
    timerValueExpired: {
        color: theme.colors.error,
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
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    otpBoxDisabled: {
        opacity: 0.5,
        borderColor: theme.colors.border,
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
