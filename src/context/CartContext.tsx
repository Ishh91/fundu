import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product, SparePart } from '../types';

type CartItem = {
  type: 'product' | 'spare_part';
  item: Product | SparePart;
  quantity: number;
};

type CartContextValue = {
  cartItem: CartItem | null;
  setCartItem: (item: CartItem | null) => void;
  addToCart: (item: Product | SparePart, quantity?: number) => void;
  deliveryDetails: {
    name: string;
    phone: string;
    address: string;
    area: string;
  } | null;
  setDeliveryDetails: (details: {
    name: string;
    phone: string;
    address: string;
    area: string;
  } | null) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<{
    name: string;
    phone: string;
    address: string;
    area: string;
  } | null>(null);

  const addToCart = (item: Product | SparePart, quantity = 1) => {
    const isProduct = 'storage' in item || 'condition' in item || 'brand' in item;
    setCartItem({
      type: isProduct ? 'product' : 'spare_part',
      item,
      quantity,
    });
  };

  const clearCart = () => {
    setCartItem(null);
    setDeliveryDetails(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItem,
        setCartItem,
        addToCart,
        deliveryDetails,
        setDeliveryDetails,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
