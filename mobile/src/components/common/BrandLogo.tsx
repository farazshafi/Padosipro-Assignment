import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface BrandLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showTagline?: boolean;
    showText?: boolean;
    style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
    size = 'md',
    showTagline = false,
    showText = true,
    style,
}) => {
    const getLogoDimensions = () => {
        switch (size) {
            case 'sm':
                return { width: 28, height: 28, fontSize: 20, gap: 8 };
            case 'lg':
                return { width: 54, height: 54, fontSize: 32, gap: 14 };
            case 'md':
            default:
                return { width: 40, height: 40, fontSize: 26, gap: 10 };
        }
    };

    const dims = getLogoDimensions();

    return (
        <View style={[styles.container, style]}>
            {showTagline ? (
                <View style={styles.taglinePill}>
                    <View style={styles.dot} />
                    <Text style={styles.taglineText}>INDIA RUNS WITH LIFESTYLE MANAGER</Text>
                </View>
            ) : null}

            <View style={[styles.brandRow, { gap: dims.gap }]}>
                <Image
                    source={require('../../../assets/padosiprologo.webp')}
                    style={{ width: dims.width, height: dims.height }}
                    resizeMode="contain"
                />
                {showText ? (
                    <Text style={[styles.brandName, { fontSize: dims.fontSize }]}>
                        Padosi<Text style={styles.brandAccent}>Pro</Text>
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    taglinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.35)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 5,
        borderRadius: theme.radius.full,
        marginBottom: theme.spacing.md,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.primary,
    },
    taglineText: {
        fontSize: 10,
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.primary,
        letterSpacing: 0.8,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        fontWeight: theme.typography.fontWeights.bold,
        color: theme.colors.textPrimary,
        letterSpacing: -0.5,
    },
    brandAccent: {
        color: theme.colors.primary,
    },
});
