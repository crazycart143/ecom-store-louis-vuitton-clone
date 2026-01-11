"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Add a slight delay before hiding to ensure smooth transition
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isFinished) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center"
        >
          <div className="relative flex flex-col items-center">
            {/* Elegant Monogram-style "LV" or sleek text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-white text-4xl md:text-6xl font-serif tracking-[0.2em] mb-8 italic"
            >
              LOUIS VUITTON
            </motion.div>

            {/* Premium Loader Bar */}
            <div className="w-48 h-px bg-zinc-800 relative overflow-hidden">
              <motion.div
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-white"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/50 font-luxury"
            >
              Loading High Definition Experience
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
