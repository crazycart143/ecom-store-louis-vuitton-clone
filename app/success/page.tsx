"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart on success
    clearCart();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header variant="white" />
      <div className="pt-40 pb-24 flex flex-col items-center justify-center text-center px-6">
        <div className="mb-8 text-green-500">
          <CheckCircle size={80} strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-serif mb-4 uppercase tracking-widest">Thank You</h1>
        <p className="text-zinc-500 max-w-md mx-auto mb-12 font-light leading-relaxed">
          Your order has been placed successfully. You will receive a confirmation email shortly.
          You can track your order status in your account dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/account"
            className="bg-black text-white px-8 py-4 rounded-full text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            View Orders <ArrowRight size={14} />
          </Link>
          <Link 
            href="/"
            className="border border-zinc-200 text-black px-8 py-4 rounded-full text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-50 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
