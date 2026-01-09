"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SmoothScroll } from "./SmoothScroll";
import { Toaster } from "sonner";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          <SmoothScroll>
            {children}
            <Toaster position="bottom-right" richColors />
          </SmoothScroll>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
};
