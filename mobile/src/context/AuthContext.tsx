import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authStorage, StoredUser } from '../services/storage/authStorage';

export interface User extends StoredUser {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role?: string;
    isVerified?: boolean;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userPartial: Partial<User>) => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const [storedToken, storedUser] = await Promise.all([
                authStorage.getToken(),
                authStorage.getUser(),
            ]);

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser as User);
            } else {
                setToken(null);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to initialize auth status:', error);
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (newToken: string, newUser: User) => {
        try {
            await Promise.all([
                authStorage.saveToken(newToken),
                authStorage.saveUser(newUser),
            ]);
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Error during login state update:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authStorage.clearSession();
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const updateUser = async (userPartial: Partial<User>) => {
        if (!user) return;
        try {
            const updatedUser = { ...user, ...userPartial };
            await authStorage.saveUser(updatedUser);
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating user in AuthContext:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        checkAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
