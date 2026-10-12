import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useAuth } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { getUserInfo, saveFavorites } from '@/services/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
        if (stored) {
          setFavorites(prev => [...new Set([...prev, ...JSON.parse(stored)])]);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsHydrated(true);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites)).catch(e => 
        console.error('Failed to save favorites:', e)
      );
    }
  }, [favorites, isHydrated]);

  const { user } = useAuth();
  const userId = user?.id;
  const prevUserId = useRef(userId);
  const syncedFor = useRef<typeof userId>(undefined);

  // Signing out clears them from the phone; they stay on the account.
  useEffect(() => {
    if (prevUserId.current != null && userId == null) {
      setFavorites([]);
      syncedFor.current = undefined;
    }
    prevUserId.current = userId;
  }, [userId]);

  // Signing in pulls the account's favorites, merged with any on this phone.
  // Shares the ['me'] request the root layout already prefetches.
  useEffect(() => {
    if (userId == null) return;
    let cancelled = false;
    queryClient
      .fetchQuery({ queryKey: ['me', userId], queryFn: () => getUserInfo(String(userId)) })
      .then((me) => {
        if (cancelled) return;
        const saved: number[] = me?.user?.favorites ?? [];
        setFavorites(prev => [...new Set([...saved, ...prev])]);
        syncedFor.current = userId;
      })
      .catch((e) => console.error('Failed to load favorites:', e));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Push changes back once synced; the delay batches quick taps into one save.
  useEffect(() => {
    if (userId == null || syncedFor.current !== userId) return;
    const timer = setTimeout(() => {
      saveFavorites(String(userId), favorites).catch((e) => console.error('Failed to save favorites:', e));
    }, 800);
    return () => clearTimeout(timer);
  }, [favorites, userId]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id],
    );
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, isFavorite }),
    [favorites, toggleFavorite, isFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
