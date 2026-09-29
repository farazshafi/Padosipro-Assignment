import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@padosipro_auth_token';
const USER_KEY = '@padosipro_user_data';

export interface StoredUser {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role?: string;
    [key: string]: any;
}

export const authStorage = {
    /**
     * Save auth token
     */
    async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving auth token:', error);
        }
    },

    /**
     * Get auth token
     */
    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    },

    /**
     * Remove auth token
     */
    async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error removing auth token:', error);
        }
    },

    /**
     * Save user data
     */
    async saveUser(user: StoredUser): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    },

    /**
     * Get user data
     */
    async getUser(): Promise<StoredUser | null> {
        try {
            const data = await AsyncStorage.getItem(USER_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    /**
     * Remove user data
     */
    async removeUser(): Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error('Error removing user data:', error);
        }
    },

    /**
     * Clear all auth session data
     */
    async clearSession(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    },
};
