import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, SparePart } from '../types';

export type CartItem = {
  id: string; // Unique key: e.g. "prod123_128GB_Excellent" or "part456"
  type: 'product' | 'spare_part';
  item: Product | SparePart;
  quantity: number;
};

export type DeliveryDetails = {
  name: string;
  phone: string;
  address: string;
  area: string;
};

type CartContextValue = {
  cartItems: CartItem[];
  cartItem: CartItem | null; // Primary/first item for backward compatibility
  totalItems: number;
  totalAmount: number;
  addToCart: (item: Product | SparePart, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  setCartItem: (item: CartItem | null) => void;
  deliveryDetails: DeliveryDetails | null;
  setDeliveryDetails: (details: DeliveryDetails | null) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const getItemKey = (item: Product | SparePart): string => {
  const isProduct = 'storage' in item || 'condition' in item || 'brand' in item;
  if (isProduct) {
    const p = item as any;
    const baseId = p.id || p.model || p.title || 'prod';
    const storage = p.storage || '';
    const condition = p.condition || '';
    return `${baseId}_${storage}_${condition}`;
  }
  return String(item.id || item.title || 'part');
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Persisted cart items
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fundu_cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') {
          return [
            {
              id: parsed.id || getItemKey(parsed.item),
              type: parsed.type || 'product',
              item: parsed.item,
              quantity: parsed.quantity || 1,
            },
          ];
        }
      }
    } catch {}
    return [];
  });

  // Persisted delivery details
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(() => {
    try {
      const saved = localStorage.getItem('fundu_cart_delivery');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fundu_cart_items', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Sync delivery details to localStorage
  useEffect(() => {
    try {
      if (deliveryDetails) {
        localStorage.setItem('fundu_cart_delivery', JSON.stringify(deliveryDetails));
      } else {
        localStorage.removeItem('fundu_cart_delivery');
      }
    } catch {}
  }, [deliveryDetails]);

  /**
   * Add item to cart. If already present, increments quantity.
   */
  const addToCart = (item: Product | SparePart, quantity = 1) => {
    const key = getItemKey(item);
    const isProduct = 'storage' in item || 'condition' in item || 'brand' in item;
    const addQty = Math.max(1, quantity);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.id === key);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentQty = updated[existingIdx].quantity || 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          item, // update with latest item info if changed
          quantity: currentQty + addQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: key,
          type: isProduct ? 'product' : 'spare_part',
          item,
          quantity: addQty,
        },
      ];
    });
  };

  /**
   * Set or update specific item quantity. Removes if <= 0.
   */
  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((ci) => ci.id !== id);
      }
      return prev.map((ci) => (ci.id === id ? { ...ci, quantity } : ci));
    });
  };

  /**
   * Remove item from cart by key id
   */
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== id));
  };

  /**
   * Backward-compatibility helper for old setCartItem calls.
   */
  const setCartItem = (ci: CartItem | null) => {
    if (!ci) {
      clearCart();
      return;
    }
    addToCart(ci.item, ci.quantity || 1);
  };

  /**
   * Completely clear cart and details
   */
  const clearCart = () => {
    setCartItems([]);
    setDeliveryDetails(null);
    try {
      localStorage.removeItem('fundu_cart_items');
      localStorage.removeItem('fundu_cart_delivery');
    } catch {}
  };

  // Computed metrics
  const totalItems = cartItems.reduce((acc, ci) => acc + (ci.quantity || 1), 0);
  const totalAmount = cartItems.reduce(
    (acc, ci) => acc + ((ci.item?.price || 0) * (ci.quantity || 1)),
    0
  );
  const cartItem = cartItems[0] || null;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItem,
        totalItems,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        setCartItem,
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
