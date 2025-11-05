import { GoogleUserInfo, useGoogleAuth } from '@/services/googleAuth';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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
  logout: () => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signInWithGoogle, isReady } = useGoogleAuth();
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
    } catch (error) {
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
    } catch (error) {
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

  const logout = () => {
    setUser(null);
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