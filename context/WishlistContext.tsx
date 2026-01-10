"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem("lv_wishlist");
  };

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("lv_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("lv_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      toast.success(`${product.name} added to wishlist`);
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    const itemToRemove = wishlist.find(i => i.id === productId);
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} removed from wishlist`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
