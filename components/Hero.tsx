"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[110vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background with parallax */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/30 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://vod.freecaster.com/louisvuitton/a0b5cc73-c0b8-4796-b8ee-0da3533eca07/OaSv8GvtSX5fmfhOlVcH6EFU_11.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="container relative z-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          style={{ opacity }}
        >
          <p className="text-[10px] md:text-xs uppercase font-luxury tracking-[0.5em] text-white/80 mb-6 antialiased">
            Women's Spring-Summer 2026 Collection
          </p>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif text-white tracking-wider mb-12 italic leading-tight">
            Le Monogram <br /> 130th Anniversary
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="px-10 py-4 bg-white text-black text-[10px] font-luxury hover:bg-zinc-200 transition-all duration-500 rounded-full">
              Learn More
            </button>
            <button className="px-10 py-4 border border-white text-white text-[10px] font-luxury hover:bg-white hover:text-black transition-all duration-500 rounded-full">
              Discover the Collections
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <ChevronDown className="text-white animate-bounce" size={32} strokeWidth={1} />
      </motion.div>
    </section>
  );
}
