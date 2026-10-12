import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useLocalization } from '@/context/LocalizationContext';
import { unregisterPush } from '@/lib/notifications';
import { queryClient } from '@/lib/queryClient';
import { login, loginWithGoogle, logout, signup } from '@/services/auth';
import { onSessionExpired } from '@/services/axios';
import { GoogleUserInfo, useGoogleAuth } from '@/services/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

interface User {
  id: string | number;
  email: string;
  fullName: string;
  profilePicture?: string;
  authProvider: 'email' | 'google';
  token: string;
  address?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  signupUser: (fullName: string, email: string, password: string) => Promise<void>;
  loginUserWithGoogle: () => Promise<User>;
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLoggingOut: boolean;
  isHydrating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const { signInWithGoogle, isReady } = useGoogleAuth();
  const { t, language } = useLocalization();

  // Load user from local storage on app start
  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.authUser);
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to hydrate auth user', e);
      } finally {
        setIsHydrating(false);
      }
    };
    hydrate();
  }, []);

  // Persist user on change
  useEffect(() => {
    const persist = async () => {
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.authUser, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.authUser);
      }
    };
    persist();
  }, [user]);

  // Email/password login
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await login(email, password);
      setUser({
        ...response,
        authProvider: 'email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Email signup
  const signupUser = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await signup(fullName, email, password);
      setUser({
        ...response,
        authProvider: 'email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const loginUserWithGoogle = async () => {
    if (!isReady) throw new Error('Google auth not ready yet');

    setIsGoogleLoading(true);
    try {
      const googleUser: GoogleUserInfo | null = await signInWithGoogle();

      if (!googleUser) throw new Error('Google login failed or was cancelled');

      // Call backend google login — backend verifies the token with Google itself
      const backendUser = await loginWithGoogle(googleUser.accessToken);

      const finalUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        fullName: backendUser.fullName,
        profilePicture: backendUser.profilePicture ?? googleUser.picture,
        token: backendUser.token,
        authProvider: 'google'
      };

      setUser(finalUser);
      return finalUser;
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Logout
  const logoutUser = async () => {
    setIsLoggingOut(true);
    try {
      if (user) await unregisterPush(user.id, language);
      // Server logout is a no-op; never let a network error keep someone signed in.
      await logout(user?.token || '').catch(() => {});
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.authUser);
      // Drop cached orders/profile so the next account never sees them.
      queryClient.clear();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Expired token or deleted account: sign out properly, otherwise the route
  // guard sees a user and bounces straight back from the login screen.
  // Several requests can fail together, so only the first one acts.
  const expiring = useRef(false);
  useEffect(() => {
    onSessionExpired(() => {
      if (!user || expiring.current) return;
      expiring.current = true;
      Alert.alert(t('sessionExpired'), t('sessionExpiredBody'));
      logoutUser().finally(() => {
        expiring.current = false;
      });
    });
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginUser,
        signupUser,
        loginUserWithGoogle,
        logoutUser,
        isLoading,
        isGoogleLoading,
        isLoggingOut,
        isHydrating
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
