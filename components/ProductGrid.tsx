"use client";

import { PRODUCTS } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

export function ProductGrid() {
  const { addToCart } = useCart();

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="container mx-auto">
        <header className="mb-16 text-center">
          <p className="text-[10px] uppercase font-luxury tracking-[0.3em] text-zinc-400 mb-2">The Selection</p>
          <h2 className="text-3xl md:text-4xl font-serif">A Selection of the Maison's Creations</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-4/5 bg-zinc-50 overflow-hidden mb-6 flex items-center justify-center p-8">
                  <div className="w-full h-full relative transition-transform duration-1000 group-hover:scale-105">
                     <Image 
                       src={product.image}
                       alt={product.name}
                       fill
                       className="object-contain"
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                     />
                  </div>
                  <button 
                    className="absolute top-4 right-4 z-20 hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      // Wishlist logic would go here
                    }}
                  >
                    <Heart size={20} className="text-zinc-400 hover:text-black transition-colors" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="w-full bg-white text-black py-4 text-[10px] font-luxury tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-xl"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-[11px] tracking-widest uppercase font-medium line-clamp-1 group-hover:underline underline-offset-4 decoration-zinc-300">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 tracking-widest">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="px-12 py-4 border border-black rounded-full text-[10px] font-luxury tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-500">
            Discover the Collection
          </button>
        </div>
      </div>
    </section>
  );
}
