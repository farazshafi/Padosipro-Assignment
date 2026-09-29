import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../services/api';
import { LoadingSpinner, ErrorMessage, Button, Input, BrandLogo } from '../../components/common';
import { theme } from '../../theme';

interface ProfileData {
    id?: string;
    name: string;
    mobile_number: string;
    address: string;
    business_name?: string | null;
}

export const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState('');
    const [businessName, setBusinessName] = useState('');

    const fetchProfile = useCallback(async () => {
        setError(null);
        try {
            const res = await apiClient.get('/profile');
            const data = res.data?.profile || (res.data?.name ? res.data : null);
            if (data) {
                setProfile(data);
                setName(data.name || '');
                setMobileNumber(data.mobile_number || '');
                setAddress(data.address || '');
                setBusinessName(data.business_name || '');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Failed to fetch profile details.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleSaveProfile = async () => {
        const cleanName = name.trim();
        const nameLetters = (cleanName.match(/[a-zA-Z]/g) || []).length;
        const nameRegex = /^[a-zA-Z\s'.]{2,50}$/;

        if (!cleanName || !nameRegex.test(cleanName) || nameLetters < 2) {
            Alert.alert('Invalid Name', 'Full name must contain at least 2 letters (e.g. Rahul Sharma).');
            return;
        }

        if (!mobileNumber.trim() || !address.trim()) {
            Alert.alert('Required Fields', 'Please fill in Mobile Number and Address.');
            return;
        }

        setSaving(true);
        try {
            const res = await apiClient.put('/profile', {
                name: cleanName,
                mobile_number: mobileNumber.trim(),
                address: address.trim(),
                business_name: businessName.trim() || undefined,
            });

            if (res.success) {
                const updated = res.data?.profile || res.data;
                setProfile(updated || { name: cleanName, mobile_number: mobileNumber, address, business_name: businessName });
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully!');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out of PadosiPro?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading profile..." />;
    }

    const initials = (profile?.name || user?.email || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Top Brand Header */}
                <View style={styles.headerBar}>
                    <BrandLogo size="sm" showText />
                </View>

                {/* Header Avatar Card */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{profile?.name || 'Padosi User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                {error ? <ErrorMessage message={error} onRetry={fetchProfile} /> : null}

                {/* Details / Edit Form Card */}
                <View style={styles.detailsCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Account Details</Text>
                        {!isEditing ? (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Text style={styles.editButtonText}>Edit</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {isEditing ? (
                        <View style={styles.formGroup}>
                            <Input
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholder="Your Full Name"
                            />
                            <Input
                                label="Mobile Number"
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                placeholder="+919876543210"
                                keyboardType="phone-pad"
                            />
                            <Input
                                label="House / Apartment Address"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Flat No, Building, Street"
                                multiline
                            />
                            <Input
                                label="Business Name (Optional)"
                                value={businessName}
                                onChangeText={setBusinessName}
                                placeholder="E.g. Sharma Plumbing Services"
                            />

                            <View style={styles.formActions}>
                                <Button
                                    title="Cancel"
                                    variant="outline"
                                    onPress={() => {
                                        setIsEditing(false);
                                        if (profile) {
                                            setName(profile.name);
                                            setMobileNumber(profile.mobile_number);
                                            setAddress(profile.address);
                                            setBusinessName(profile.business_name || '');
                                        }
                                    }}
                                    fullWidth={false}
                                />
                                <Button
                                    title="Save Changes"
                                    onPress={handleSaveProfile}
                                    loading={saving}
                                    fullWidth={false}
                                />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoList}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Full Name</Text>
                                <Text style={styles.infoValue}>{profile?.name || 'Not provided'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Email Address</Text>
                                <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Mobile Number</Text>
                                <Text style={styles.infoValue}>{profile?.mobile_number || 'Not provided'}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>{profile?.address || 'Not provided'}</Text>
                            </View>
                            {profile?.business_name ? (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Business Name</Text>
                                        <Text style={styles.infoValue}>{profile.business_name}</Text>
                                    </View>
                                </>
                            ) : null}
                        </View>
                    )}
                </View>

                {/* Logout Button */}
                <View style={styles.logoutWrapper}>
                    <Button
                        title="Log Out"
                        variant="outline"
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
    },
    headerBar: {
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
    },
    headerCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    avatarText: {
        fontSize: theme.typography.fontSizes.xxl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textInverse,
    },
    userName: {
        fontSize: theme.typography.fontSizes.xl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xxs,
    },
    userEmail: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
    },
    detailsCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    cardTitle: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
    },
    editButtonText: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primary,
    },
    infoList: {
        gap: theme.spacing.sm,
    },
    infoItem: {
        paddingVertical: theme.spacing.xs,
    },
    infoLabel: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textMuted,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.medium,
        color: theme.colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
    },
    formGroup: {
        gap: theme.spacing.sm,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    logoutWrapper: {
        marginTop: theme.spacing.md,
    },
});
