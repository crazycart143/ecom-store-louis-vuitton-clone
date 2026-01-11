"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  useScrollLock(isOpen);
  const [contrastEnabled, setContrastEnabled] = useState(false);


  const mainLinks = [
    "Monogram Anniversary",
    "Gifts and Personalization",
    "New",
    "Bags and Small Leather Goods",
    "Women",
    "Men",
    "Perfumes and Beauty",
    "Jewelry",
    "Watches",
    "Trunks, Travel and Home",
    "Services",
    "The Maison Louis Vuitton",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-95 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-full max-w-[500px] bg-white z-100 shadow-2xl flex flex-col"
          >
            <div className="p-8 shrink-0">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
              >
                <X size={20} />
                <span className="text-sm font-medium">Close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <nav className="flex flex-col gap-6 mb-12">
                {mainLinks.map((link) => (
                  <Link 
                    key={link} 
                    href="#" 
                    className="text-2xl font-serif tracking-tight text-black hover:opacity-60 transition-opacity"
                  >
                    {link}
                  </Link>
                ))}
              </nav>

              <div className="pt-8 border-t border-zinc-100 italic font-serif text-xl mb-8">
                <Link href="#" className="hover:opacity-60 transition-opacity">Can we help you?</Link>
              </div>

              <div className="pt-8 border-t border-zinc-100 flex flex-col gap-4 text-sm font-medium text-black">
                <Link href="#" className="hover:opacity-60 transition-opacity">Sustainability</Link>
                <Link href="#" className="hover:opacity-60 transition-opacity">Find a Store</Link>
                <Link href="#" className="hover:opacity-60 transition-opacity">International (English)</Link>
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-sm font-medium">Accessibility: Enhanced contrast</span>
                <button 
                  onClick={() => setContrastEnabled(!contrastEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${contrastEnabled ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                >
                  <motion.div 
                    animate={{ x: contrastEnabled ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
