"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { PRODUCTS } from "@/lib/data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Heart, Plus, Minus, ChevronRight, Share2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const product = PRODUCTS.find((p) => p.id === id);

  const [isReadMore, setIsReadMore] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-serif">Product not found</p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <main className="min-h-screen bg-white">
      <Header variant="white" />
      
      <div className="pt-20 md:pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Left: Product Image */}
            <div className="w-full lg:w-[60%]">
              <div className="aspect-4/5 bg-zinc-50 relative overflow-hidden group">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-[40%] space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-500">
                      {product.sku || "REF. N/A"}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-black">
                      {product.name}
                    </h1>
                  </div>
                  <button className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                    <Heart size={20} className="text-zinc-400 hover:text-black transition-colors" />
                  </button>
                </div>

                <p className="text-xl font-medium tracking-tight">
                  ${product.price?.toLocaleString()}
                </p>

                <button className="w-full bg-black text-white py-5 rounded-full text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-800 transition-colors shadow-lg">
                  Contact an advisor
                </button>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div 
                  className={`text-[13px] leading-relaxed text-zinc-600 font-light overflow-hidden transition-all duration-500 ${isReadMore ? 'max-h-[1000px]' : 'max-h-[80px]'}`}
                >
                  {product.description}
                  <div className="mt-4">
                    <ul className="list-disc list-inside space-y-1">
                      {product.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReadMore(!isReadMore)}
                  className="text-[11px] font-medium underline underline-offset-4 decoration-zinc-300 hover:decoration-black transition-colors"
                >
                  {isReadMore ? "Read less" : "Read more"}
                </button>
              </div>

              {/* Accordion Sections */}
              <div className="border-t border-zinc-100">
                <AccordionItem 
                  title="In-store service" 
                  isOpen={openSection === 'store'} 
                  onClick={() => toggleSection('store')}
                >
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-light">
                    Check availability in your nearest Louis Vuitton store. We offer personalized assistance and product demonstrations.
                  </p>
                </AccordionItem>

                <AccordionItem 
                  title="Gifting" 
                  isOpen={openSection === 'gift'} 
                  onClick={() => toggleSection('gift')}
                >
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-light">
                    Every order is elegantly presented in our signature Louis Vuitton packaging. You can also add a personalized message to your gift.
                  </p>
                </AccordionItem>

                <AccordionItem 
                  title="Delivery & Returns" 
                  isOpen={openSection === 'delivery'} 
                  onClick={() => toggleSection('delivery')}
                >
                  <p className="text-[12px] text-zinc-500 leading-relaxed font-light">
                    Complimentary standard delivery. Returns are free and can be made within 30 days of receiving your order.
                  </p>
                </AccordionItem>
              </div>

              {/* Share & More */}
              <div className="flex items-center gap-6 pt-6">
                <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                  <Share2 size={14} />
                  Share
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function AccordionItem({ title, isOpen, onClick, children }: { title: string, isOpen: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-100">
      <button 
        onClick={onClick}
        className="w-full py-6 flex justify-between items-center group"
      >
        <span className="text-[13px] tracking-wide text-black group-hover:text-zinc-500 transition-colors uppercase font-light">
          {title}
        </span>
        {isOpen ? <Minus size={16} className="text-zinc-400" /> : <Plus size={16} className="text-zinc-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
