"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Image from "next/image";

import Link from "next/link";

const MIDNIGHT_PRODUCTS = [
  {
    id: "midnight-1",
    name: "Discovery Cargo Backpack",
    image: "/images/louis-vuitton-discovery-cargo-backpack--M26765_PM2_Front view.avif"
  },
  {
    id: "midnight-2",
    name: "Nil",
    image: "/images/louis-vuitton-nil--M26783_PM2_Front view.avif"
  },
  {
    id: "midnight-3",
    name: "Compact Magnet",
    image: "/images/louis-vuitton-compact-magnet--M26742_PM2_Front view.avif"
  },
  {
    id: "midnight-4",
    name: "Keepall Bandoulière 25",
    image: "/images/louis-vuitton-keepall-bandouliere-25--M28369_PM2_Front view.avif"
  }
];

export function MonogramMidnightSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <header className="text-center mb-16 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-zinc-500">MEN</p>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-black">Monogram Midnight</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {MIDNIGHT_PRODUCTS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/product/${item.id}`} className="cursor-pointer block">
                <div className="aspect-4/5 w-full bg-linear-to-b from-[#EAEAEA] to-[#F9F9F9] relative overflow-hidden mb-6 flex items-center justify-center p-12">
                  <div className="relative w-full h-full transition-transform duration-1000 group-hover:scale-105">
                    <Image 
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <button className="absolute top-4 right-4 z-20 hover:scale-110 transition-transform" onClick={(e) => e.preventDefault()}>
                    <Heart size={20} className="text-zinc-400 hover:text-black transition-colors" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-[11px] leading-relaxed tracking-wide text-black group-hover:underline underline-offset-4 decoration-zinc-300">
                    {item.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-12 py-4 border border-black rounded-full text-[10px] font-luxury tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 uppercase whitespace-nowrap">
            Discover Leather Goods
          </button>
          <button className="px-12 py-4 border border-black rounded-full text-[10px] font-luxury tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 uppercase whitespace-nowrap">
            Discover Small Leather Goods
          </button>
        </div>
      </div>
    </section>
  );
}
