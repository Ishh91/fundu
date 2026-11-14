import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, SparePart } from '../types';
import { getItemVariant } from '../lib/cartItem';
import { clampLineQuantity, maxForLine, reconcileLines, type FreshListing } from '../lib/cartLimits';

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
  /** Adds up to what is in stock. `added` is how many went in; `limited` is true when it was cut down. */
  addToCart: (item: Product | SparePart, quantity?: number) => { added: number; limited: boolean };
  updateQuantity: (id: string, quantity: number) => { quantity: number; limited: boolean };
  /** How many units this line may hold at most, counting the listing's other lines. */
  maxQuantityFor: (id: string) => number;
  /** Applies the shop's current stock (by product id) to the cart; returns a message per change made. */
  syncStock: (fresh: Record<string, FreshListing>) => string[];
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
  const baseId = item.id || `${item.brand || ''}_${item.model || ''}_${item.title || ''}`;
  const { storage, condition, color } = getItemVariant(item);
  return `${baseId}_${storage}_${condition}_${color}`.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
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
  const addToCart = (item: Product | SparePart, quantity = 1): { added: number; limited: boolean } => {
    if (!item) return { added: 0, limited: false };
    const key = getItemKey(item);
    const type: CartItem['type'] = 'storage' in item || 'condition' in item || 'brand' in item ? 'product' : 'spare_part';
    const wanted = Math.max(1, Number(quantity) || 1);
    const existing = cartItems.find((ci) => ci.id === key);
    const currentQty = existing ? Math.max(1, Number(existing.quantity) || 1) : 0;

    // The cap is per listing: other lines of the same phone (other storage or colour) use the same stock.
    const { quantity: finalQty } = clampLineQuantity(cartItems, { id: key, type, item }, currentQty + wanted);
    const added = Math.max(0, finalQty - currentQty);
    const limited = added < wanted;
    if (finalQty <= 0) return { added: 0, limited: true };

    setCartItems((prev) => {
      const idx = prev.findIndex((ci) => ci.id === key);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], item, quantity: finalQty }; // keep the latest item info
        return updated;
      }
      return [...prev, { id: key, type, item, quantity: finalQty }];
    });

    setIsCartOpen(true);
    return { added, limited };
  };

  /**
   * Set or update specific item quantity, never above the stock. Removes if <= 0.
   */
  const updateQuantity = (id: string, quantity: number): { quantity: number; limited: boolean } => {
    const q = Number(quantity);
    const line = cartItems.find((ci) => ci.id === id);
    if (!line) return { quantity: 0, limited: false };
    if (q <= 0) {
      setCartItems((prev) => prev.filter((ci) => ci.id !== id));
      return { quantity: 0, limited: false };
    }
    const result = clampLineQuantity(cartItems, line, q);
    setCartItems((prev) =>
      result.quantity <= 0 ? prev.filter((ci) => ci.id !== id) : prev.map((ci) => (ci.id === id ? { ...ci, quantity: result.quantity } : ci)),
    );
    return result;
  };

  const syncStock = (fresh: Record<string, FreshListing>): string[] => {
    const { lines, messages } = reconcileLines(cartItems, fresh);
    if (messages.length > 0) setCartItems(lines);
    return messages;
  };

  const maxQuantityFor = (id: string): number => {
    const line = cartItems.find((ci) => ci.id === id);
    return line ? maxForLine(cartItems, line) : 0;
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
        maxQuantityFor,
        syncStock,
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
