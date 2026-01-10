import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FlyToCart } from '@/components/FlyToCart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface FlyToCartData {
  id: string;
  image: string;
  startRect: DOMRect;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, rect?: DOMRect) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<FlyToCartData | null>(null);
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('lv_cart');
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lv_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lv_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any, rect?: DOMRect) => {
    if (rect) {
      setAnimatingItem({
        id: product.id,
        image: product.image,
        startRect: rect
      });
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`Increased quantity of ${product.name}`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${product.name} added to bag`);
      return [...prev, { ...product, quantity: 1 }];
    });

    // Wait for animation to finish before opening cart, or just open after a bit
    if (!rect) {
      setIsOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(i => i.id === id);
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} removed from bag`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, isOpen, toggleCart }}>
      {children}
      <FlyToCart 
        item={animatingItem} 
        onComplete={() => {
          setAnimatingItem(null);
          setIsOpen(true);
        }} 
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
