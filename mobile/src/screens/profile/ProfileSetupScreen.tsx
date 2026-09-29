import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, ErrorMessage } from '../../components/common';
import { apiClient, ApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

interface ProfileSetupScreenProps {
    onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.fullName || '');
    const [mobileNumber, setMobileNumber] = useState(user?.phoneNumber || '+91');
    const [address, setAddress] = useState('');
    const [businessName, setBusinessName] = useState('');

    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string | undefined } = {};
        let valid = true;

        if (!name.trim()) {
            newErrors.name = 'Full name is required';
            valid = false;
        }

        const cleanMobile = mobileNumber.trim();
        if (!cleanMobile) {
            newErrors.mobileNumber = 'Mobile number is required';
            valid = false;
        } else {
            const indianMobileRegex = /^\+91[6-9]\d{9}$/;
            if (!indianMobileRegex.test(cleanMobile)) {
                newErrors.mobileNumber =
                    'Enter a valid Indian mobile number starting with +91 (e.g. +919876543210)';
                valid = false;
            }
        }

        if (!address.trim()) {
            newErrors.address = 'Address is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSaveProfile = async () => {
        setApiError(null);

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await apiClient.post('/profile', {
                name: name.trim(),
                mobile_number: mobileNumber.trim(),
                address: address.trim(),
                business_name: businessName.trim() || undefined,
            });

            if (response.success && response.data) {
                await updateUser({
                    fullName: response.data.name || name.trim(),
                    phoneNumber: response.data.mobile_number || mobileNumber.trim(),
                    isProfileComplete: true,
                });
                onComplete();
            } else {
                setApiError(response.message || 'Failed to save profile details.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setApiError(err.message);
                if (err.errors && Array.isArray(err.errors)) {
                    const fieldErrs: { [key: string]: string } = {};
                    err.errors.forEach((e: { field?: string; message: string }) => {
                        if (e.field === 'name') fieldErrs.name = e.message;
                        if (e.field === 'mobile_number') fieldErrs.mobileNumber = e.message;
                        if (e.field === 'address') fieldErrs.address = e.message;
                    });
                    setErrors((prev) => ({ ...prev, ...fieldErrs }));
                }
            } else {
                setApiError('Network connection error while saving profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.keyboardView} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Please provide your contact details to personalize your PadosiPro experience.
                        </Text>
                    </View>

                    {apiError ? (
                        <ErrorMessage
                            title="Profile Error"
                            message={apiError}
                            variant="card"
                            style={styles.errorCard}
                        />
                    ) : null}

                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="e.g. Rahul Sharma"
                            value={name}
                            onChangeText={(text: string) => {
                                setName(text);
                                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            error={errors.name}
                            autoCapitalize="words"
                        />

                        <Input
                            label="Mobile Number"
                            placeholder="+919876543210"
                            value={mobileNumber}
                            onChangeText={(text: string) => {
                                setMobileNumber(text);
                                if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: undefined }));
                            }}
                            error={errors.mobileNumber}
                            helperText="Include country code (+91) followed by 10 digits"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Address"
                            placeholder="House/Flat No., Street, Area, City"
                            value={address}
                            onChangeText={(text: string) => {
                                setAddress(text);
                                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                            }}
                            error={errors.address}
                            multiline
                            numberOfLines={3}
                            inputStyle={styles.multilineInput}
                        />

                        <Input
                            label="Business / Household Name (Optional)"
                            placeholder="e.g. Sharma Residency"
                            value={businessName}
                            onChangeText={(text: string) => setBusinessName(text)}
                            autoCapitalize="words"
                        />

                        <Button
                            title="Save Profile & Continue"
                            onPress={handleSaveProfile}
                            loading={loading}
                            style={styles.saveButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: theme.spacing.xs,
    },
    saveButton: {
        marginTop: theme.spacing.md,
    },
});
