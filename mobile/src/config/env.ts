import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getHostIp = (): string | undefined => {
    const hostUri = Constants.expoConfig?.hostUri || (Constants.manifest as any)?.debuggerHost;
    if (hostUri) {
        return hostUri.split(':')[0];
    }
    return undefined;
};

const getFallbackApiUrl = (): string => {
    const hostIp = getHostIp();
    if (hostIp) {
        return `http://${hostIp}:4000/api`;
    }

    if (Platform.OS === 'android') {
        // Fallback for physical Android device on Wi-Fi
        return 'http://192.168.1.12:4000/api';
    }
    // iOS simulator & Web default
    return 'http://localhost:4000/api';
};

export const env = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || getFallbackApiUrl(),
    API_TIMEOUT_MS: 15000,
    APP_NAME: 'PadosiPro',
    IS_DEV: __DEV__,
} as const;

export type Env = typeof env;

