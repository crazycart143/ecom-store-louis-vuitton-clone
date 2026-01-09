import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Search as SearchIcon } from "lucide-react";
import { PRODUCTS } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const trendingSearches = ["alma", "speedy", "keepall", "sneaker", "backpack"];

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    return PRODUCTS.filter((p) => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 bg-white z-110 overflow-y-auto"
        >
          {/* Fixed Close Button */}
          <button 
            onClick={onClose}
            className="fixed top-8 right-8 z-120 p-2 hover:rotate-90 transition-transform duration-300 text-black"
          >
            <X size={32} strokeWidth={1} />
          </button>

          <div className="w-full flex flex-col pt-12">
            {/* Header / Logo */}
            <div className="text-center mb-12">
              <Link href="/" onClick={onClose}>
                <h1 className="text-2xl md:text-3xl font-serif tracking-[0.3em] uppercase text-black">
                  Louis Vuitton
                </h1>
              </Link>
            </div>

            {/* Search Input Section */}
            <div className="max-w-3xl mx-auto w-full mb-16 px-6">
              <div className="relative mb-6">
                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, collections, etc." 
                  className="w-full h-16 pl-16 pr-8 border border-zinc-200 rounded-full text-base font-light tracking-wide focus:outline-none focus:border-black transition-colors"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <span className="text-[10px] uppercase font-luxury tracking-widest text-zinc-400">Trending Searches</span>
                {trendingSearches.map((term) => (
                  <button 
                    key={term} 
                    onClick={() => setQuery(term)}
                    className="text-xs font-medium hover:underline lowercase tracking-tight text-zinc-600 hover:text-black transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Section */}
            <div className="px-6 md:px-12 pb-20">
              {query.trim() === "" ? (
                <div className="space-y-20">
                  <section>
                    <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
                      <h2 className="text-[11px] uppercase tracking-widest font-semibold text-zinc-900">Featured Suggestions</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12">
                      {PRODUCTS.slice(4, 10).map((product) => (
                        <SearchProductCard 
                          key={product.id} 
                          product={product} 
                          onClose={onClose} 
                          toggleWishlist={toggleWishlist}
                          isWishlisted={isInWishlist(product.id)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <section>
                  <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
                    <h2 className="text-[11px] uppercase tracking-widest font-semibold text-zinc-900">
                      {filteredProducts.length} Results for "{query}"
                    </h2>
                  </div>
                  
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12">
                      {filteredProducts.map((product) => (
                        <SearchProductCard 
                          key={product.id} 
                          product={product} 
                          onClose={onClose}
                          toggleWishlist={toggleWishlist}
                          isWishlisted={isInWishlist(product.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-zinc-500 font-light italic">No results found for "{query}".</p>
                      <button 
                        onClick={() => setQuery("")}
                        className="mt-4 text-[10px] uppercase tracking-widest border-b border-black pb-0.5"
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchProductCard({ product, onClose, toggleWishlist, isWishlisted }: { 
  product: any, 
  onClose: () => void,
  toggleWishlist: (p: any) => void,
  isWishlisted: boolean
}) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-4/5 bg-zinc-50 mb-4 overflow-hidden rounded-sm">
        <button 
          className="absolute top-3 right-3 z-10 hover:scale-110 transition-transform p-1.5 bg-white/50 backdrop-blur-sm rounded-full"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
        >
          <Heart 
            size={14} 
            strokeWidth={1.5} 
            className={`transition-colors ${isWishlisted ? "fill-black text-black" : "text-zinc-600 hover:text-black"}`} 
          />
        </button>
        <Link href={`/product/${product.id}`} onClick={onClose}>
          <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-110 relative flex items-center justify-center p-4">
            <Image 
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="200px"
            />
          </div>
        </Link>
      </div>
      <Link href={`/product/${product.id}`} onClick={onClose} className="space-y-1 block">
         <p className="text-[9px] text-zinc-400 font-medium tracking-widest uppercase">{product.category}</p>
         <h3 className="text-[10px] font-medium tracking-wide uppercase leading-tight line-clamp-1 group-hover:underline underline-offset-2">
          {product.name}
         </h3>
         <p className="text-[10px] text-zinc-900 font-luxury">${product.price.toLocaleString()}</p>
      </Link>
    </div>
  );
}
