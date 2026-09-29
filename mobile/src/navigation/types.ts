import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: { message?: string; email?: string } | undefined;
    Register: undefined;
    OTPVerification: { email: string };
};

export type MainTabParamList = {
    Home: undefined;
    Tasks: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
};

// Auth Navigation Props
export type AuthNavigationProp<T extends keyof AuthStackParamList> = NativeStackNavigationProp<
    AuthStackParamList,
    T
>;

export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<
    AuthStackParamList,
    T
>;

// Main Tab Navigation Props
export type MainTabNavigationProp<T extends keyof MainTabParamList> = BottomTabNavigationProp<
    MainTabParamList,
    T
>;

export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<
    MainTabParamList,
    T
>;
