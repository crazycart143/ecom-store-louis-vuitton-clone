"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Heart, Plus, Minus, Share2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Reveal } from "@/components/Reveal";
import Script from "next/script";

interface ProductClientProps {
  product: any;
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [isReadMore, setIsReadMore] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const productImage = typeof product.image === 'string' ? product.image : (product.images?.[0]?.url || '/placeholder.png');
  const productDetails = Array.isArray(product.details) ? product.details.map((d: any) => typeof d === 'string' ? d : d.content) : [];
  const isWishlisted = isInWishlist(product._id || product.id);

  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  // Structured Data for SEO (kept for client-side hydration if needed, but main SEO is in server component)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": productImage,
    "description": product.description,
    "sku": product.sku || product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://louis-vuitton-clone.vercel.app/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "brand": {
      "@type": "Brand",
      "name": "Louis Vuitton"
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header variant="white" />
      
      <div className="pt-20 md:pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
            
            {/* Left: Product Image */}
            <div className="w-full lg:w-[60%]">
              <Reveal>
                <div className="aspect-4/5 bg-zinc-50 relative overflow-hidden group">
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    className="object-contain p-12 transition-transform duration-1000 group-hover:scale-105"
                    priority
                  />
                  {isOutOfStock && (
                      <div className="absolute top-4 left-4 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 z-10">
                          Sold Out
                      </div>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-[40%] space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-zinc-500">
                      {product.sku || (product.handle ? `REF. ${product.handle.toUpperCase()}` : "REF. N/A")}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-black">
                      {product.name}
                    </h1>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleWishlist({ ...product, id: product._id || product.id, image: productImage })}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all duration-300 group"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isWishlisted ? "active" : "inactive"}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart 
                          size={20} 
                          strokeWidth={1.5}
                          className={`transition-colors ${isWishlisted ? "fill-black text-black" : "text-zinc-400 group-hover:text-black"}`} 
                        />
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xl font-medium tracking-tight">
                      ${product.price?.toLocaleString()}
                    </p>
                    {!isOutOfStock && stock < 5 && stock > 0 && (
                      <p className="text-[11px] text-red-600 font-medium animate-pulse flex items-center gap-1">
                        <AlertCircle size={12} /> Only {stock} left
                      </p>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  {!isOutOfStock && (
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Quantity</span>
                      <div className="flex items-center border border-zinc-200 rounded-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="p-3 hover:bg-zinc-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} className="text-zinc-600" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={stock}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.min(stock, Math.max(1, val)));
                          }}
                          className="w-16 text-center text-sm font-medium border-x border-zinc-200 py-2 focus:outline-none focus:bg-zinc-50"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          disabled={quantity >= stock}
                          className="p-3 hover:bg-zinc-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} className="text-zinc-600" />
                        </button>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {stock} available
                      </span>
                    </div>
                  )}

                  <button 
                    disabled={isOutOfStock}
                    onClick={() => {
                      const img = document.querySelector('img[alt="' + product.name + '"]');
                      const rect = img?.getBoundingClientRect();
                      // Add to cart with quantity
                      for (let i = 0; i < quantity; i++) {
                        addToCart({
                          id: product._id || product.id,
                          name: product.name,
                          price: product.price,
                          image: product.images?.[0]?.url || product.image
                        }, rect);
                      }
                    }}
                    className={`w-full py-5 text-[11px] font-luxury tracking-[0.2em] uppercase transition-all duration-500 shadow-2xl active:scale-[0.98] ${
                      isOutOfStock 
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none" 
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `Add ${quantity > 1 ? quantity + ' ' : ''}to cart`}
                  </button>
                </div>
              </motion.div>

              {/* Description */}
              <Reveal delay={0.2}>
                <div className="space-y-4">
                  <div 
                    className={`text-[13px] leading-relaxed text-zinc-600 font-light overflow-hidden transition-all duration-500 ${isReadMore ? 'max-h-[1000px]' : 'max-h-[80px]'}`}
                  >
                    {product.description}
                    <div className="mt-4">
                      <ul className="list-disc list-inside space-y-1">
                        {productDetails.map((detail: string, i: number) => (
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
              </Reveal>

              {/* Accordion Sections */}
              <Reveal delay={0.4}>
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
              </Reveal>

              {/* Share & More */}
              <Reveal delay={0.6}>
                <div className="flex items-center gap-6 pt-6">
                  <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                    <Share2 size={14} />
                    Share
                  </button>
                </div>
              </Reveal>

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
