"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();

  // 1. Initial Load from LocalStorage (for guests)
  useEffect(() => {
    const savedWishlist = localStorage.getItem("lv_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse local wishlist");
      }
    }
    setIsLoaded(true);
  }, []);

  // 2. Load/Sync with DB when user logs in
  useEffect(() => {
    if (status === "authenticated" && isLoaded) {
      const syncWishlist = async () => {
        try {
          const res = await fetch("/api/user/wishlist");
          if (res.ok) {
            const dbWishlist = await res.json();
            
            // Optional: Merge local wishlist into DB for first-time login
            const localWishlist = JSON.parse(localStorage.getItem("lv_wishlist") || "[]");
            if (localWishlist.length > 0) {
              for (const item of localWishlist) {
                if (!dbWishlist.find((dbItem: any) => dbItem.id === item.id)) {
                  // Add local item to DB
                  await fetch("/api/user/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: item.id })
                  });
                  dbWishlist.push(item);
                }
              }
              // Clear local storage after merging
              localStorage.removeItem("lv_wishlist");
            }
            
            setWishlist(dbWishlist);
          }
        } catch (err) {
          console.error("Failed to fetch/sync wishlist", err);
        }
      };
      syncWishlist();
    }
  }, [status, isLoaded]);

  // 3. Keep LocalStorage in sync (only for guests)
  useEffect(() => {
    if (isLoaded && status === "unauthenticated") {
      localStorage.setItem("lv_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded, status]);

  const clearWishlist = () => {
    setWishlist([]);
    if (status === "unauthenticated") {
      localStorage.removeItem("lv_wishlist");
    }
    // We don't necessarily want to clear DB on local 'clear' unless specified
  };

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;

    setWishlist((prev) => [...prev, product]);
    toast.success(`${product.name} added to wishlist`);

    if (status === "authenticated") {
      try {
        await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id })
        });
      } catch (err) {
        console.error("Failed to sync wishlist add", err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const itemToRemove = wishlist.find(i => i.id === productId);
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} removed from wishlist`);
    }

    if (status === "authenticated") {
      try {
        await fetch("/api/user/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
      } catch (err) {
        console.error("Failed to sync wishlist remove", err);
      }
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
