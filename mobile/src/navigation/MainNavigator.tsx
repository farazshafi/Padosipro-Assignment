import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TaskSelectionScreen } from '../screens/tasks/TaskSelectionScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
    const [isEditingTasks, setIsEditingTasks] = useState(false);

    if (isEditingTasks) {
        return (
            <TaskSelectionScreen
                onComplete={() => setIsEditingTasks(false)}
            />
        );
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Tasks') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: theme.spacing.xs,
                    paddingTop: theme.spacing.xs,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: theme.typography.fontSizes.xs,
                    fontWeight: theme.typography.fontWeights.medium,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                options={{
                    title: 'Home',
                }}
            >
                {() => <HomeScreen onManageTasks={() => setIsEditingTasks(true)} />}
            </Tab.Screen>

            <Tab.Screen
                name="Tasks"
                options={{
                    title: 'Services',
                }}
            >
                {() => (
                    <TaskSelectionScreen
                        onComplete={() => setIsEditingTasks(false)}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
};

