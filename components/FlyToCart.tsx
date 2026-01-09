"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FlyToCartItem {
  id: string;
  image: string;
  startRect: DOMRect;
}

interface FlyToCartProps {
  item: FlyToCartItem | null;
  onComplete: () => void;
}

export function FlyToCart({ item, onComplete }: FlyToCartProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (item) {
      const cartIcon = document.getElementById("cart-icon");
      if (cartIcon) {
        setTargetRect(cartIcon.getBoundingClientRect());
      }
    }
  }, [item]);

  if (!item || !targetRect) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-9999">
      <motion.div
        initial={{
          top: item.startRect.top,
          left: item.startRect.left,
          width: item.startRect.width,
          height: item.startRect.height,
          opacity: 1,
          scale: 1,
        }}
        animate={{
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left + targetRect.width / 2,
          width: 20,
          height: 20,
          opacity: 0.8,
          scale: 0.1,
        }}
        transition={{
          duration: 0.8,
          ease: [0.19, 1, 0.22, 1], // Custom luxury ease
        }}
        onAnimationComplete={onComplete}
        className="fixed overflow-hidden rounded-full border border-white shadow-xl bg-white flex items-center justify-center p-1 z-9999"
      >
        <Image
          src={item.image}
          alt="Adding to cart"
          width={item.startRect.width}
          height={item.startRect.height}
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
