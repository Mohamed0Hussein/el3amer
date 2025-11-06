import { GoogleUserInfo, useGoogleAuth } from '@/services/googleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  authProvider: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser({
        id: '1',
        email,
        fullName: 'John Doe',
        authProvider: 'email',
      });
    } catch {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUser({
        id: '1',
        email,
        fullName,
        authProvider: 'email',
      });
    } catch {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isReady) {
      console.log('Google auth not ready yet');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const googleUser: GoogleUserInfo | null = await signInWithGoogle();
      
      if (googleUser) {
        setUser({
          id: googleUser.id,
          email: googleUser.email,
          fullName: googleUser.name,
          avatar: googleUser.picture,
          authProvider: 'google',
        });
      } else {
        throw new Error('Google login failed or was cancelled');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Google login failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate logout process (e.g., API call to invalidate token)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Logout error:', error);
      // Still clear user even if storage removal fails
      setUser(null);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    logout,
    isLoading,
    isGoogleLoading,
    isLoggingOut,
    isHydrating,
  };

  return (
    <AuthContext.Provider value={value}>
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