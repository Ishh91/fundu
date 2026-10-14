import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, SparePart } from '../types';

export type CartItem = {
  id: string; // Unique key: e.g. "sample-apple-15pro_128_gb_excellent"
  type: 'product' | 'spare_part';
  item: Product | SparePart;
  quantity: number;
};

export type DeliveryDetails = {
  name: string;
  phone: string;
  address: string;
  area: string;
  locality?: string;
  pincode?: string;
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
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const getItemKey = (item: Product | SparePart): string => {
  if (!item) return `item_${Date.now()}_${Math.random()}`;
  const isProduct = 'storage' in item || 'condition' in item || 'brand' in item;
  if (isProduct) {
    const p = item as any;
    const baseId = p.id || `${p.brand || ''}_${p.model || ''}_${p.title || ''}`;
    const storage = p.storage || '';
    const condition = p.condition || '';
    const color = p.color || '';
    return `${baseId}_${storage}_${condition}_${color}`.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  }
  return String((item as any).id || (item as any).title || `part_${Date.now()}`);
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart open/drawer state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persisted cart items
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fundu_cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((ci) => ({
            id: ci.id || (ci.item ? getItemKey(ci.item) : `item_${Math.random()}`),
            type: ci.type || 'product',
            item: ci.item,
            quantity: Math.max(1, Number(ci.quantity) || 1),
          }));
        }
        if (parsed && typeof parsed === 'object' && parsed.item) {
          return [
            {
              id: parsed.id || getItemKey(parsed.item),
              type: parsed.type || 'product',
              item: parsed.item,
              quantity: Math.max(1, Number(parsed.quantity) || 1),
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

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  /**
   * Add item to cart. If already present, increments quantity.
   * Supports unlimited items and auto-opens the cart drawer.
   */
  const addToCart = (item: Product | SparePart, quantity = 1) => {
    if (!item) return;
    const key = getItemKey(item);
    const isProduct = 'storage' in item || 'condition' in item || 'brand' in item;
    const addQty = Math.max(1, Number(quantity) || 1);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((ci) => ci.id === key);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentQty = Math.max(1, Number(updated[existingIdx].quantity) || 1);
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

    setIsCartOpen(true);
  };

  /**
   * Set or update specific item quantity. Removes if <= 0.
   */
  const updateQuantity = (id: string, quantity: number) => {
    const q = Number(quantity);
    setCartItems((prev) => {
      if (q <= 0) {
        return prev.filter((ci) => ci.id !== id);
      }
      return prev.map((ci) => (ci.id === id ? { ...ci, quantity: q } : ci));
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
  const totalItems = cartItems.reduce((acc, ci) => acc + (Math.max(1, Number(ci.quantity) || 1)), 0);
  const totalAmount = cartItems.reduce(
    (acc, ci) => acc + ((ci.item?.price || 0) * Math.max(1, Number(ci.quantity) || 1)),
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
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
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
