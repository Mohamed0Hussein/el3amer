import { STORAGE_KEYS } from '@/constants/storageKeys';
import { CartItem } from '@/types/CardItem';
import { Product } from '@/types/Product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQuantity: (id: number, change: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  isHydrated: boolean;
  cartTotal: number;
  cartItemCount: number;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(STORAGE_KEYS.cartItems);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart from storage:', error);
      } finally {
        setIsHydrated(true);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.cartItems, JSON.stringify(cart));
        } catch (error) {
          console.error('Failed to save cart to storage:', error);
        }
      };
      saveCart();
    }
  }, [cart, isHydrated]);

  // Quantities never go above the stock we last saw; the backend re-checks at checkout.
  // Signing out empties the cart so the next account on this phone starts clean.
  const { user } = useAuth();
  const prevUserId = useRef(user?.id);
  useEffect(() => {
    if (prevUserId.current != null && user == null) setCart([]);
    prevUserId.current = user?.id;
  }, [user]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      return existing
        ? prev.map(p => p.id === product.id
            ? { ...p, stock: product.stock, quantity: Math.min(p.quantity + 1, product.stock) }
            : p)
        : [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const updateCartQuantity = useCallback((id: number, change: number) => {
    setCart(prev =>
      prev
        .map(p => p.id === id ? { ...p, quantity: Math.min(p.quantity + change, p.stock) } : p)
        .filter(p => p.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback(
    (id: number) => setCart(prev => prev.filter(p => p.id !== id)),
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const cartItemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      isHydrated,
      cartTotal,
      cartItemCount,
    }),
    [
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      isHydrated,
      cartTotal,
      cartItemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartContextProvider');
  }
  return context;
};
