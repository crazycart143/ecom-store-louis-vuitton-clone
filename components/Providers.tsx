"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SmoothScroll } from "./SmoothScroll";
import { Toaster } from "sonner";
import AnnouncementBar from "./AnnouncementBar";
import ImpersonationBar from "./ImpersonationBar";
import { Cart } from "./Cart";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <ImpersonationBar />
      <CartProvider>
        <WishlistProvider>
          <AnnouncementBar />
          <SmoothScroll>
            {children}
            <Cart />
            <Toaster position="bottom-right" richColors />
          </SmoothScroll>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
};
