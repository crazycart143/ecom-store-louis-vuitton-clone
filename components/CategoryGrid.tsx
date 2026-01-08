"use client";

import React from "react";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    name: "Women's Handbags",
    image: "/categories/Women_Handbags_2_WW_HP_Category_Push_DII.webp",
    id: "handbags"
  },
  {
    name: "Women's Wallets and Small Leather Goods",
    image: "/categories/Women_Wallets_SLG_WW_HP_Category_Push_DII.webp",
    id: "wallets"
  },
  {
    name: "Women's Accessories",
    image: "/categories/Women_Scarves_New_WW_HP_category_Push_DII.webp",
    id: "accessories"
  },
  {
    name: "Beauty",
    image: "/categories/Beauty_Lips_WW_HP_Category_Push_DII.webp",
    id: "beauty"
  },
  {
    name: "Men's Bags",
    image: "/categories/Men_Bags_2_WW_HP_Category_Push_DII.webp",
    id: "men_bags"
  },
  {
    name: "Men's Wallets and Small Leather Goods",
    image: "/categories/Men_Wallets_SLG_3_WW_HP_Category_Push_DII.webp",
    id: "men_wallets"
  },
  {
    name: "Men's Accessories",
    image: "/categories/Men_Scarves_New_WW_HP_category_Push_DII.webp",
    id: "men_accessories"
  },
  {
    name: "Perfumes",
    image: "/categories/Perfumes_Holiday25_WW_HP_Category_DII.webp",
    id: "perfumes"
  }
];

export function CategoryGrid() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-serif text-center mb-20 tracking-tight">
          Explore a Selection of the Maison's Creations
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          {CATEGORIES.map((cat, index) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              viewport={{ once: true }}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="aspect-4/5 w-full bg-zinc-50 overflow-hidden mb-6 relative">
                 <div 
                   className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                   style={{ backgroundImage: `url(${cat.image})` }}
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>
              <h3 className="text-[12px] uppercase tracking-[0.2em] font-medium text-black text-center group-hover:opacity-70 transition-opacity max-w-[200px] leading-relaxed">
                {cat.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
