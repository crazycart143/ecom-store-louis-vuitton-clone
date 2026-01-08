"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { PRODUCTS } from "@/lib/data";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const trendingSearches = ["neverfull", "speedy", "wallet", "pochette", "belt"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white z-[110] overflow-y-auto"
        >
          {/* Fixed Close Button */}
          <button 
            onClick={onClose}
            className="fixed top-8 right-8 z-[120] p-2 hover:opacity-50 transition-opacity text-black"
          >
            <X size={32} strokeWidth={1.5} />
          </button>

          <div className="w-full flex flex-col pt-12">
            {/* Header / Logo */}
            <div className="text-center mb-12">
              <h1 className="text-2xl md:text-3xl font-serif tracking-[0.3em] uppercase text-black">
                Louis Vuitton
              </h1>
            </div>

            {/* Search Input Section */}
            <div className="max-w-3xl mx-auto w-full mb-16 px-6">
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search for a store" 
                  className="w-full h-14 px-8 border border-zinc-200 rounded-full text-sm font-medium tracking-wide focus:outline-none focus:border-zinc-400 transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <span className="text-[10px] uppercase font-luxury tracking-widest text-zinc-400">Trending Searches</span>
                {trendingSearches.map((term) => (
                  <button key={term} className="text-sm font-medium hover:underline lowercase tracking-tight">
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Sections - Full Width Container */}
            <div className="px-6 md:px-12 pb-20 space-y-20">
              <section>
                <div className="mb-8">
                  <h2 className="text-sm font-medium tracking-wide text-zinc-800">Preorder Now Men Spring-Summer 2026</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
                  {/* Fill with more products or repeating to show the full width effect if needed, 
                      but let's just make the existing ones look good */}
                  {PRODUCTS.map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="relative aspect-[4/5] bg-zinc-50 mb-4 overflow-hidden">
                        <button className="absolute top-3 right-3 z-10 hover:scale-110 transition-transform">
                          <Heart size={18} strokeWidth={1} className="text-zinc-600 hover:text-black" />
                        </button>
                        <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-105 bg-zinc-100 flex items-center justify-center">
                          <span className="text-[10px] uppercase font-luxury tracking-widest text-zinc-300">Product</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Preorder Now</p>
                         <h3 className="text-[11px] font-medium tracking-wide uppercase leading-tight line-clamp-2">{product.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-8">
                  <h2 className="text-sm font-medium tracking-wide text-zinc-800">Most Coveted Gifts</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-8">
                  {[...PRODUCTS].reverse().map((product) => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="relative aspect-[4/5] bg-zinc-50 mb-4 overflow-hidden">
                        <button className="absolute top-3 right-3 z-10 hover:scale-110 transition-transform">
                          <Heart size={18} strokeWidth={1} className="text-zinc-600 hover:text-black" />
                        </button>
                        <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-105 bg-zinc-100 flex items-center justify-center">
                          <span className="text-[10px] uppercase font-luxury tracking-widest text-zinc-300">Product</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-[11px] font-serif italic tracking-tight">{product.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
