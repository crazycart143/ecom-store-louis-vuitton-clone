"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Cart() {
  const { cart, isOpen, toggleCart, removeFromCart, updateQuantity, total } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    toggleCart();
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} />
                <h2 className="text-sm font-luxury font-medium tracking-widest uppercase">Shopping Bag ({cart.length})</h2>
              </div>
              <button onClick={toggleCart} className="hover:opacity-70 transition-opacity">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag size={48} className="text-zinc-200" />
                  <p className="text-zinc-400 uppercase tracking-widest text-[10px]">Your bag is currently empty</p>
                  <button onClick={toggleCart} className="text-[10px] font-luxury border-b border-black pb-1 hover:opacity-70 transition-opacity">
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="relative w-24 h-32 bg-zinc-50 flex-shrink-0 group overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-[10px] font-luxury tracking-widest text-zinc-400 mb-1 uppercase">Creation</h3>
                        <h4 className="text-[13px] font-medium uppercase tracking-widest line-clamp-2">{item.name}</h4>
                        <p className="text-[11px] text-zinc-800 mt-2 font-medium tracking-wide">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-zinc-100 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-zinc-400">
                            <Minus size={10} />
                          </button>
                          <span className="w-8 text-center text-[11px] font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-zinc-400">
                            <Plus size={10} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline underline-offset-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t space-y-6 bg-zinc-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-luxury">Shipping</span>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Complimentary</span>
                  </div>
                  <div className="flex items-center justify-between font-medium pt-2">
                    <span className="text-xs uppercase tracking-[0.2em] font-luxury">Total</span>
                    <span className="text-lg tracking-tight">${total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {!session && (
                    <p className="text-[10px] text-center text-zinc-400 italic">
                      Please <Link href="/login" className="underline text-black">Login</Link> to proceed with your creation.
                    </p>
                  )}
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-5 text-[10px] font-luxury tracking-[0.2em] hover:bg-zinc-800 transition-all uppercase rounded-full"
                  >
                    PROCEED TO CHECKOUT
                  </button>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.15em] text-center px-4 leading-relaxed">
                    Complimentary delivery and returns on all orders.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
