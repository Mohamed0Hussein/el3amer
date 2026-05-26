import { STORAGE_KEYS } from '@/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
          setFavorites(JSON.parse(stored));
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
