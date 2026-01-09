"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
        if (ref.current) {
            ref.current.textContent = `${prefix}${latest.toLocaleString(undefined, { maximumFractionDigits: 0 })}${suffix}`; // Simplified for integers initially, can adjust for floats
        }
    });
  }, [springValue, prefix, suffix]);

  return <span ref={ref} />;
}
