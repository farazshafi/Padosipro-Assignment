import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface CardProps {
    children: ReactNode;
    elevation?: 'none' | 'sm' | 'md' | 'lg';
    padding?: keyof typeof theme.spacing;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    elevation = 'sm',
    padding = 'md',
    style,
}) => {
    return (
        <View
            style={[
                styles.card,
                theme.shadows[elevation],
                { padding: theme.spacing[padding] },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
});
