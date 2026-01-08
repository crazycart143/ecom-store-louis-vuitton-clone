"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const LATEST_WOMEN = [
  {
    id: "latest-w-1",
    name: "Alma Trunk 20",
    image: "/images/louis-vuitton-alma-trunk-20--M26784_PM2_Front view.avif"
  },
  {
    id: "latest-w-2",
    name: "LV Script Hoops PM",
    image: "/images/louis-vuitton-lv-script-hoops-pm--M03527_PM2_Front view.avif"
  },
  {
    id: "latest-w-3",
    name: "Monogram Button Cardigan",
    image: "/images/louis-vuitton-monogram-button-cardigan--FUKG11SH2900_PM2_Front view.avif"
  },
  {
    id: "latest-w-4",
    name: "Citizen Flat Ranger Boot",
    image: "/images/louis-vuitton-citizen-flat-ranger-boot--ASQAU4PC02_PM2_Front view.avif"
  }
];

export function LatestWomenSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <header className="text-center mb-16 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-zinc-500">WOMEN</p>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-black">The latest</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {LATEST_WOMEN.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={`/product/${item.id}`} className="cursor-pointer block">
                <div className="aspect-4/5 w-full bg-linear-to-b from-[#EAEAEA] to-[#F9F9F9] relative overflow-hidden mb-6 flex items-center justify-center p-8">
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

        <div className="flex justify-center">
          <button className="px-12 py-4 border border-black rounded-full text-[10px] font-luxury tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-500 uppercase">
            Discover the Selection
          </button>
        </div>
      </div>
    </section>
  );
}
