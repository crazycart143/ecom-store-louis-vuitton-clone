"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { wishlist } = useWishlist();

  return (
    <main className="min-h-screen bg-white">
      <Header variant="white" />
      
      <div className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          {wishlist.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className="space-y-8 py-20"
            >
              <h1 className="text-3xl md:text-4xl font-serif text-black">
                Your wishlist is empty!
              </h1>
              <p className="text-sm text-zinc-500 tracking-wide">
                Add your favorite items and share them.
              </p>
              <div className="pt-4">
                {session ? (
                  <Link 
                    href="/" 
                    className="inline-block px-12 py-4 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                  >
                    Start Shopping
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="inline-block px-12 py-4 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12 pb-20">
              <h1 className="text-3xl font-serif">Your Wishlist</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map((item) => (
                  <div key={item.id} className="group text-left space-y-4">
                    <div className="aspect-4/5 bg-zinc-100 flex items-center justify-center relative overflow-hidden">
                       <span className="text-[10px] uppercase tracking-widest text-zinc-400">Louis Vuitton Asset</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm uppercase font-medium tracking-widest">{item.name}</h3>
                      <p className="text-xs text-zinc-500">${item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 mb-12">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Link href="/" className="hover:text-black hover:underline underline-offset-4 transition-colors">Louis Vuitton</Link>
            <span>·</span>
            <span>MyLV</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
