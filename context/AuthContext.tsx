import { useLocalization } from '@/context/LocalizationContext';
import { unregisterPush } from '@/lib/notifications';
import { queryClient } from '@/lib/queryClient';
import { clearSession, loadSession, saveSession } from '@/lib/session';
import { login, loginWithGoogle, logout, signup } from '@/services/auth';
import { onSessionExpired } from '@/services/axios';
import { GoogleUserInfo, useGoogleAuth } from '@/services/googleAuth';
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
  replaceToken: (token: string) => Promise<void>;
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

  // Load the saved session on app start
  useEffect(() => {
    loadSession<User>()
      .then(setUser)
      .catch((e) => console.warn('Failed to load the saved session', e))
      .finally(() => setIsHydrating(false));
  }, []);

  const signedIn = async (next: User) => {
    await saveSession(next);
    setUser(next);
  };

  // Changing the password signs out every other phone; this one gets a new token.
  const replaceToken = async (token: string) => {
    if (user) await signedIn({ ...user, token });
  };

  // Email/password login
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await login(email, password);
      await signedIn({
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
      await signedIn({
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

      await signedIn(finalUser);
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
      await clearSession();
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
        replaceToken,
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
