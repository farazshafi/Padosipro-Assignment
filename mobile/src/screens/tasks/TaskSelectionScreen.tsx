import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
} from 'react-native';
import { apiClient, ApiError } from '../../services/api';
import { LoadingSpinner, ErrorMessage, EmptyState, Button, Badge } from '../../components/common';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TaskItem {
    id: string;
    category_id: string;
    category_name: string;
    category_slug: string;
    name: string;
    description: string;
}

interface CategoryWithTasks {
    id: string;
    name: string;
    slug: string;
    description: string;
    tasks: TaskItem[];
}

interface TaskSelectionScreenProps {
    onComplete: () => void;
}

export const TaskSelectionScreen: React.FC<TaskSelectionScreenProps> = ({ onComplete }) => {
    const [categories, setCategories] = useState<CategoryWithTasks[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTasksAndSelection = useCallback(async () => {
        setError(null);
        try {
            // Fetch task catalogue and existing user selection in parallel
            const [catalogueRes, userTasksRes] = await Promise.all([
                apiClient.get('/tasks'),
                apiClient.get('/user-tasks').catch(() => ({ success: false, data: [] })),
            ]);

            if (catalogueRes.success && catalogueRes.data) {
                setCategories(catalogueRes.data);
            } else {
                setError(catalogueRes.message || 'Failed to load task catalogue.');
            }

            if (userTasksRes.success && Array.isArray(userTasksRes.data)) {
                const existingIds = new Set<string>(
                    userTasksRes.data.map((ut: any) => ut.task_id || ut.id)
                );
                setSelectedTaskIds(existingIds);
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Network error. Unable to connect to task catalogue service.');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTasksAndSelection();
    }, [fetchTasksAndSelection]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTasksAndSelection();
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(taskId)) {
                updated.delete(taskId);
            } else {
                updated.add(taskId);
            }
            return updated;
        });
    };

    const handleSaveTasks = async () => {
        setError(null);
        setSaving(true);

        try {
            const response = await apiClient.post('/user-tasks', {
                taskIds: Array.from(selectedTaskIds),
            });

            if (response.success) {
                onComplete();
            } else {
                setError(response.message || 'Failed to save task selection.');
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Network error while saving task preferences.');
            }
        } finally {
            setSaving(false);
        }
    };

    // Filter tasks based on category tab & search query
    const filteredCategories = categories
        .map((category) => {
            if (selectedCategorySlug && category.slug !== selectedCategorySlug) {
                return null;
            }

            const matchingTasks = category.tasks.filter((task) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.trim().toLowerCase();
                return (
                    task.name.toLowerCase().includes(q) ||
                    task.description.toLowerCase().includes(q)
                );
            });

            if (matchingTasks.length === 0) return null;

            return {
                ...category,
                tasks: matchingTasks,
            };
        })
        .filter((cat): cat is CategoryWithTasks => cat !== null);

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading task catalogue..." />;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header & Search Bar */}
            <View style={styles.header}>
                <Text style={styles.title}>Select Your Services</Text>
                <Text style={styles.subtitle}>
                    Choose the tasks you would like to request or offer in your neighborhood
                </Text>

                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search tasks (e.g. plumbing, groceries)..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* Category Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryPillsScroll}
                    contentContainerStyle={styles.categoryPillsContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.pill,
                            selectedCategorySlug === null && styles.pillActive,
                        ]}
                        onPress={() => setSelectedCategorySlug(null)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.pillText,
                                selectedCategorySlug === null && styles.pillTextActive,
                            ]}
                        >
                            All Categories
                        </Text>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.pill,
                                selectedCategorySlug === cat.slug && styles.pillActive,
                            ]}
                            onPress={() =>
                                setSelectedCategorySlug(
                                    selectedCategorySlug === cat.slug ? null : cat.slug
                                )
                            }
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.pillText,
                                    selectedCategorySlug === cat.slug && styles.pillTextActive,
                                ]}
                            >
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Error state alert */}
            {error ? (
                <View style={styles.errorContainer}>
                    <ErrorMessage
                        title="Catalogue Error"
                        message={error}
                        onRetry={fetchTasksAndSelection}
                        retryText="Reload Tasks"
                    />
                </View>
            ) : null}

            {/* Main Task List */}
            <ScrollView
                contentContainerStyle={styles.scrollList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {filteredCategories.length === 0 ? (
                    <EmptyState
                        title="No Tasks Found"
                        description={
                            searchQuery
                                ? `No tasks matching "${searchQuery}". Try clearing search or selecting a different category.`
                                : 'No tasks available in this category at the moment.'
                        }
                        actionLabel="Reset Search & Filters"
                        onAction={() => {
                            setSearchQuery('');
                            setSelectedCategorySlug(null);
                        }}
                    />
                ) : (
                    filteredCategories.map((category) => (
                        <View key={category.id} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category.name}</Text>

                            <View style={styles.tasksGrid}>
                                {category.tasks.map((task) => {
                                    const isSelected = selectedTaskIds.has(task.id);
                                    return (
                                        <TouchableOpacity
                                            key={task.id}
                                            style={[
                                                styles.taskCard,
                                                isSelected && styles.taskCardSelected,
                                            ]}
                                            onPress={() => toggleTaskSelection(task.id)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.taskCardHeader}>
                                                <Text
                                                    style={[
                                                        styles.taskName,
                                                        isSelected && styles.taskNameSelected,
                                                    ]}
                                                >
                                                    {task.name}
                                                </Text>
                                                <Badge
                                                    label={isSelected ? 'Selected' : 'Select'}
                                                    variant={isSelected ? 'success' : 'default'}
                                                />
                                            </View>
                                            <Text style={styles.taskDescription} numberOfLines={2}>
                                                {task.description}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Footer Confirm Action Bar */}
            <View style={styles.footerBar}>
                <Text style={styles.selectedCountText}>
                    {selectedTaskIds.size}{' '}
                    {selectedTaskIds.size === 1 ? 'task selected' : 'tasks selected'}
                </Text>

                <Button
                    title={
                        selectedTaskIds.size > 0
                            ? `Save Tasks (${selectedTaskIds.size})`
                            : 'Save & Proceed'
                    }
                    onPress={handleSaveTasks}
                    loading={saving}
                    fullWidth={false}
                    style={styles.saveButton}
                />
            </View>
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
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: theme.typography.fontSizes.xl,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xxs,
    },
    subtitle: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    searchWrapper: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        height: 42,
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    searchInput: {
        fontSize: theme.typography.fontSizes.sm,
        color: theme.colors.textPrimary,
    },
    categoryPillsScroll: {
        flexGrow: 0,
    },
    categoryPillsContent: {
        gap: theme.spacing.xs,
    },
    pill: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceVariant,
        marginRight: theme.spacing.xs,
    },
    pillActive: {
        backgroundColor: theme.colors.primary,
    },
    pillText: {
        fontSize: theme.typography.fontSizes.xs,
        fontWeight: theme.typography.fontWeights.medium,
        color: theme.colors.textSecondary,
    },
    pillTextActive: {
        color: theme.colors.textInverse,
    },
    errorContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
    },
    scrollList: {
        padding: theme.spacing.lg,
        paddingBottom: 100,
    },
    categorySection: {
        marginBottom: theme.spacing.xl,
    },
    categoryTitle: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    tasksGrid: {
        gap: theme.spacing.sm,
    },
    taskCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    taskCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    taskCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    taskName: {
        fontSize: theme.typography.fontSizes.md,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    taskNameSelected: {
        color: theme.colors.primaryDark,
    },
    taskDescription: {
        fontSize: theme.typography.fontSizes.xs,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeights.xs,
    },
    footerBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...theme.shadows.lg,
    },
    selectedCountText: {
        fontSize: theme.typography.fontSizes.sm,
        fontWeight: theme.typography.fontWeights.semibold,
        color: theme.colors.textPrimary,
    },
    saveButton: {
        minWidth: 160,
    },
});
