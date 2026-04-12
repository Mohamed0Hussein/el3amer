import { CartItem } from '@/types/CardItem';
import { Product } from '@/types/Product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

const CART_STORAGE_KEY = '@cart:items';

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
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
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
          console.error('Failed to save cart to storage:', error);
        }
      };
      saveCart();
    }
  }, [cart, isHydrated]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      return existing
        ? prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: number, change: number) => {
    setCart(prev =>
      prev
        .map(p => p.id === id ? { ...p, quantity: p.quantity + change } : p)
        .filter(p => p.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(p => p.id !== id));

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const cartItemCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(() => ({
    cart, addToCart, updateCartQuantity, removeFromCart, clearCart, isHydrated, cartTotal, cartItemCount
  }), [cart, isHydrated, cartTotal, cartItemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartContextProvider');
  }
  return context;
};
