import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { ProfileSetupScreen } from '../screens/profile/ProfileSetupScreen';
import { TaskSelectionScreen } from '../screens/tasks/TaskSelectionScreen';
import { MainNavigator } from './MainNavigator';
import { LoadingSpinner } from '../components/common';

type OnboardingStep = 'CHECKING' | 'PROFILE_SETUP' | 'TASK_SELECTION' | 'COMPLETED';

export const OnboardingManager: React.FC = () => {
    const [step, setStep] = useState<OnboardingStep>('CHECKING');

    const checkUserStatus = useCallback(async () => {
        try {
            // 1. Check Profile
            const profileRes = await apiClient.get('/profile');
            const profileData = profileRes.data?.profile || (profileRes.data?.name ? profileRes.data : null);
            const hasProfile =
                profileRes.success &&
                Boolean(
                    profileData &&
                    profileData.name &&
                    profileData.mobile_number &&
                    profileData.address
                );

            if (!hasProfile) {
                setStep('PROFILE_SETUP');
                return;
            }

            // 2. Check User Tasks
            const tasksRes = await apiClient.get('/user-tasks');
            const tasksData = Array.isArray(tasksRes.data)
                ? tasksRes.data
                : (Array.isArray(tasksRes.data?.tasks) ? tasksRes.data.tasks : []);
            const hasSelectedTasks =
                tasksRes.success && Array.isArray(tasksData) && tasksData.length > 0;

            if (!hasSelectedTasks) {
                setStep('TASK_SELECTION');
                return;
            }

            setStep('COMPLETED');
        } catch (err) {
            console.error('Error during onboarding status check:', err);
            // Fallback to Main view if backend check fails
            setStep('COMPLETED');
        }
    }, []);

    useEffect(() => {
        checkUserStatus();
    }, [checkUserStatus]);

    if (step === 'CHECKING') {
        return <LoadingSpinner fullScreen message="Setting up your environment..." />;
    }

    if (step === 'PROFILE_SETUP') {
        return (
            <ProfileSetupScreen
                onComplete={() => setStep('TASK_SELECTION')}
            />
        );
    }

    if (step === 'TASK_SELECTION') {
        return (
            <TaskSelectionScreen
                onComplete={() => setStep('COMPLETED')}
            />
        );
    }

    return <MainNavigator />;
};
