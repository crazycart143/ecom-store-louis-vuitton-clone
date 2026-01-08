"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

interface CallUsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CallUsSidebar({ isOpen, onClose }: CallUsSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-110 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white z-120 shadow-2xl overflow-y-auto"
          >
            <div className="px-12 py-16 flex flex-col min-h-full">
              <div className="flex items-center justify-between mb-20">
                <h2 className="text-[22px] font-serif text-black leading-none">Call us</h2>
                <button 
                  onClick={onClose}
                  className="transition-opacity hover:opacity-50"
                >
                  <X size={24} strokeWidth={1.5} className="text-black" />
                </button>
              </div>

              <div className="space-y-16">
                <div className="space-y-12">
                  <p className="text-[17px] leading-relaxed text-black font-light tracking-wide">
                    Wherever you are, Louis Vuitton Client Advisors will be delighted to assist you
                  </p>

                  <div className="space-y-8 pt-4">
                    <button className="w-full flex items-center gap-4 py-1 hover:opacity-50 transition-opacity text-left">
                      <Mail size={22} strokeWidth={1} />
                      <span className="text-[15px] tracking-tight">Send an Email</span>
                    </button>
                    <button className="w-full flex items-center gap-4 py-1 hover:opacity-50 transition-opacity text-left">
                      <div className="w-[22px] h-[22px] bg-black rounded-[6px] flex items-center justify-center">
                        <div className="w-[10px] h-[10px] bg-white rounded-full" />
                      </div>
                      <span className="text-[15px] tracking-tight">Apple Message</span>
                    </button>
                    <button className="w-full flex items-center gap-4 py-1 hover:opacity-50 transition-opacity text-left">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.453 5.502 3.734 7.232V22l3.359-1.844c.883.245 1.812.378 2.775.378 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.141 12.422l-2.564-2.731-5.004 2.731 5.504-5.845 2.628 2.731 4.94-2.731-5.504 5.845z"/>
                      </svg>
                      <span className="text-[15px] tracking-tight">Facebook Messenger</span>
                    </button>
                  </div>
                </div>

                <div className="pt-12 border-t border-zinc-100 space-y-12">
                  <h3 className="text-[17px] font-light text-black tracking-wide">Need Help ?</h3>
                  <div className="flex flex-col gap-8">
                    <Link href="#" className="text-[15px] tracking-tight hover:opacity-50 transition-opacity">FAQ</Link>
                    <Link href="#" className="text-[15px] tracking-tight hover:opacity-50 transition-opacity">Care Service</Link>
                    <Link href="#" className="text-[15px] tracking-tight hover:opacity-50 transition-opacity">Find a Store</Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
