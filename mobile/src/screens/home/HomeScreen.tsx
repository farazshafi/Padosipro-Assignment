import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { apiClient, ApiError } from '../../services/api';
import {
    LoadingSpinner,
    ErrorMessage,
    EmptyState,
    Badge,
    Card,
    Button,
} from '../../components/common';
import { theme } from '../../theme';

export interface SelectedTask {
    id: string;
    task_id: string;
    name: string;
    description: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    selected_at: string;
}

interface HomeScreenProps {
    onManageTasks?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onManageTasks }) => {
    const { user, logout } = useAuth();

    const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSelectedTasks = useCallback(async () => {
        setError(null);
        try {
            const response = await apiClient.get('/user-tasks');
            if (response.success && Array.isArray(response.data)) {
                setSelectedTasks(response.data);
            } else {
                setError(response.message || 'Failed to load selected tasks.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Network error. Unable to connect to server.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSelectedTasks();
    }, [fetchSelectedTasks]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSelectedTasks();
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out of PadosiPro?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Top Header */}
            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.greeting}>
                        Welcome back, {user?.fullName || user?.email?.split('@')[0] || 'Neighbor'}!
                    </Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Error Alert */}
                {error ? (
                    <ErrorMessage
                        title="Dashboard Error"
                        message={error}
                        onRetry={fetchSelectedTasks}
                        retryText="Reload Tasks"
                        style={styles.errorCard}
                    />
                ) : null}

                {/* Section Title & Manage Button */}
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Your Services & Tasks</Text>
                        <Text style={styles.sectionSubtitle}>
                            {selectedTasks.length}{' '}
                            {selectedTasks.length === 1 ? 'task active' : 'tasks active'} in your neighborhood
                        </Text>
                    </View>

                    {onManageTasks ? (
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={onManageTasks}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.manageText}>Edit Tasks</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Selected Tasks List or Empty State */}
                {selectedTasks.length === 0 ? (
                    <EmptyState
                        title="No Services Selected"
                        description="You haven't selected any household tasks or services yet. Select tasks to get started."
                        actionLabel={onManageTasks ? 'Browse & Select Tasks' : undefined}
                        onAction={onManageTasks}
                        style={styles.emptyStateCard}
                    />
                ) : (
                    <View style={styles.taskList}>
                        {selectedTasks.map((task) => (
                            <Card key={task.id || task.task_id} style={styles.taskCard} elevation="sm">
                                <View style={styles.taskCardHeader}>
                                    <Text style={styles.taskTitle}>{task.name}</Text>
                                    <Badge label={task.category_name} variant="info" />
                                </View>
                                <Text style={styles.taskDescription}>{task.description}</Text>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    headerTextContainer: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    greeting: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
    },
    userEmail: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xxs,
    },
    logoutButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.errorLight,
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    logoutText: {
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.error,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    errorCard: {
        marginBottom: theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSizes.lg,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
    },
    sectionSubtitle: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xxs,
    },
    manageButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.primaryLight,
    },
    manageText: {
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.primaryDark,
    },
    emptyStateCard: {
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    taskList: {
        gap: theme.spacing.sm,
    },
    taskCard: {
        marginBottom: theme.spacing.xs,
    },
    taskCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    taskTitle: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    taskDescription: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeights.sm,
    },
});
