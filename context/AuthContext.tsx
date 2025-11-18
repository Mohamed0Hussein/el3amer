import { getToken, login, logout, signup } from '@/services/auth';
import { GoogleUserInfo, useGoogleAuth } from '@/services/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  authProvider: 'email' | 'google';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  signupUser: (fullName: string, email: string, password: string) => Promise<void>;
  loginUserWithGoogle: () => Promise<User | undefined>;
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLoggingOut: boolean;
  isHydrating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const STORAGE_KEY = '@auth:user';
  
  const { signInWithGoogle, isReady } = useGoogleAuth();

  // Hydrate user from storage on app start
  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const savedUser: User = JSON.parse(raw);
          setUser(savedUser);
        }
      } catch (e) {
        console.warn('Failed to hydrate auth user', e);
      } finally {
        setIsHydrating(false);
      }
    };
    hydrate();
     
  }, []);

  // Persist user to storage whenever it changes
  useEffect(() => {
    const persist = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn('Failed to persist auth user', e);
      }
    };
    persist();
  }, [user]);

  
  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // login() already returns response.data, so response is the data object
      const response = await login(email, password);
      
      // Handle different response structures
      // If response has a 'data' property, use it, otherwise use response directly
      const userData = (response as any).data || response;
      setUser(userData as User);
    } catch (error: any) {
      console.error('Login error:', error);
      // Re-throw with a more descriptive message if available
      const errorMessage = error?.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // signup() already returns response.data, so response is the data object
      const response = await signup(fullName, email, password);
      
      // Handle different response structures
      const userData = (response as any).data || response;
      setUser(userData as User);
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.message || 'Signup failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUserWithGoogle = async () => {
    if (!isReady) {
      console.log('Google auth not ready yet');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const googleUser: GoogleUserInfo | null = await signInWithGoogle();
      
      if (!googleUser) {
        throw new Error('Google login failed or was cancelled');
      }
      const token = await getToken(googleUser.email);

      const user = {
        id: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        avatar: googleUser.picture,
        authProvider: 'google',
        token: token,
      };

      setUser(user as User);
      
      return user as User;
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error?.message || 'Google login failed';
      throw new Error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoggingOut(true);
    try {
      await logout(user?.token || '');
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Logout error:', error);
      throw new Error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginUser, signupUser, loginUserWithGoogle, logoutUser, isLoading, isGoogleLoading, isLoggingOut, isHydrating }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};