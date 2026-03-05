import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem } from '@/types';

const CART_KEY = 'cartItems';

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  totalCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (menuId: number) => void;
  updateQuantity: (menuId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  try {
    const s = localStorage.getItem(CART_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.menuId === item.menuId);
      if (ex) return prev.map((i) => i.menuId === item.menuId ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((menuId: number) => {
    setItems((prev) => prev.filter((i) => i.menuId !== menuId));
  }, []);

  const updateQuantity = useCallback((menuId: number, qty: number) => {
    if (qty <= 0) { setItems((prev) => prev.filter((i) => i.menuId !== menuId)); return; }
    setItems((prev) => prev.map((i) => i.menuId === menuId ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, totalAmount, totalCount, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
