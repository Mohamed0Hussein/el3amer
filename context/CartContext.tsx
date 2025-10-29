import React, { createContext, useContext, useMemo, useState } from 'react';

export const CartContext = createContext<any>(null);

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [cart, setCart] = useState<any[]>([]);

  const addToCart = (product: any) => {
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



  const value = useMemo(() => ({
    cart, addToCart, updateCartQuantity, removeFromCart,
  }), [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => useContext(CartContext);
