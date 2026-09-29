import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
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
                return { width: 32, height: 32, fontSize: 20, gap: 8 };
            case 'lg':
                return { width: 56, height: 56, fontSize: 32, gap: 14 };
            case 'md':
            default:
                return { width: 44, height: 44, fontSize: 26, gap: 10 };
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
                <Svg
                    width={dims.width}
                    height={dims.height}
                    viewBox="0 0 1080 1080"
                    fill="none"
                >
                    <G>
                        <Path
                            fill={theme.colors.primary}
                            d="M843.92,478.37l-279.15-279.21c-5.98-5.98-15.68-5.98-21.65,0l-273.48,273.55c-89.3,89.16-116.53,190.6-72.56,284.85,4.46,9.55,17.22,11.62,24.67,4.16l87.77-87.82c5.98-5.98,15.67-5.98,21.66,0l21.23,21.23,53.5,53.58c.07,0,.14.07.21.14l78.82,78.82c19.72,19.71,40.05,36.4,60.8,49.87,4.96,3.22,11.43,3.21,16.39-.01,20.75-13.5,41.09-30.14,60.81-49.86l78.75-78.82.29-.14,53.58-53.58.14-.28,21.02-20.97c5.98-5.97,15.67-5.96,21.64.01l87.85,87.84c7.45,7.45,20.21,5.4,24.65-4.15,42.91-92.17,17.8-191.36-66.94-279.19ZM564.77,724.6s-.08.08-.12.12c-5.87,5.87-15.49,5.86-21.36,0-.04-.04-.07-.07-.11-.11l-131.4-131.4c-5.98-5.98-5.98-15.68,0-21.65l131.33-131.27c5.98-5.98,15.67-5.98,21.65,0l131.33,131.27c5.98,5.98,5.98,15.67,0,21.65l-131.33,131.4Z"
                        />
                    </G>
                </Svg>

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
