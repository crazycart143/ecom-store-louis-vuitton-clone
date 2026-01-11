"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Package, 
  ShoppingBag, 
  Users, 
  Command, 
  X,
  ArrowRight,
  Loader2,
  ChevronRight
} from "lucide-react";

export function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    products: any[];
    orders: any[];
    customers: any[];
  }>({ products: [], orders: [], customers: [] });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ products: [], orders: [], customers: [] });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const navigateTo = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
      
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-300">
        {/* Search Input Area */}
        <div className="p-8 border-b border-zinc-100 flex items-center gap-4 bg-zinc-50/30">
          <div className="relative flex-1">
            <Search className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all ${isLoading ? "text-zinc-300 opacity-0" : "text-black"}`} size={24} strokeWidth={2.5} />
            {isLoading && <Loader2 className="absolute left-0 top-1/2 -translate-y-1/2 animate-spin text-black" size={24} strokeWidth={2.5} />}
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, or customers..."
              className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-[20px] font-bold placeholder:text-zinc-300 focus:outline-none text-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100/80 border border-zinc-200 text-[10px] font-black tracking-widest text-zinc-400 uppercase">
              <Command size={10} /> K
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {!query && (
            <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center mx-auto mb-6 text-zinc-300">
                <Search size={32} strokeWidth={1} />
              </div>
              <p className="text-[13px] font-black uppercase tracking-[0.2em] text-zinc-400">Type to search the Maison</p>
            </div>
          )}

          {query && !isLoading && (results.products.length + results.orders.length + results.customers.length === 0) && (
            <div className="py-20 text-center">
              <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">No results found for "{query}"</p>
            </div>
          )}

          {query && (
            <div className="space-y-8 p-4">
              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <Package size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Collections & Products</span>
                  </div>
                  <div className="grid gap-2">
                    {results.products.map((product) => (
                      <button 
                        key={product._id}
                        onClick={() => navigateTo(`/admin/products/${product._id}`)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all group text-left border border-transparent hover:border-zinc-100 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden relative border border-zinc-200">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                <Package size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-black uppercase tracking-tight">{product.name}</p>
                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest">{product.category}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-200 group-hover:text-black transition-all group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <ShoppingBag size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Order Management</span>
                  </div>
                  <div className="grid gap-2">
                    {results.orders.map((order) => (
                      <button 
                        key={order._id}
                        onClick={() => navigateTo(`/admin/orders/${order._id}`)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-zinc-900 group transition-all text-left border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-black/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-800 transition-colors">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-black group-hover:text-white transition-colors">{order.orderNumber}</p>
                            <p className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-500 transition-colors uppercase tracking-widest">{order.customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border group-hover:border-transparent group-hover:bg-white/10 ${
                            order.fulfillment === 'DELIVERED' 
                              ? "bg-green-50 text-green-600 border-green-100 group-hover:text-green-400" 
                              : "bg-zinc-50 text-zinc-500 border-zinc-100 group-hover:text-zinc-300"
                          }`}>
                            {order.fulfillment}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-150">
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <Users size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Clientele Profile</span>
                  </div>
                  <div className="grid gap-2">
                    {results.customers.map((customer) => (
                      <button 
                        key={customer._id}
                        onClick={() => navigateTo(`/admin/customers/${customer._id}`)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-100 transition-all group text-left border border-transparent hover:border-zinc-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[12px] font-black group-hover:scale-110 transition-transform">
                            {customer.name?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-black">{customer.name}</p>
                            <p className="text-[11px] font-medium text-zinc-400">{customer.email}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-zinc-200 group-hover:text-black transition-all group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
              <span className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 shadow-sm font-black">Esc</span>
              <span>Close</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
              <span className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 shadow-sm font-black">↵</span>
              <span>Select</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Louis Vuitton Maison Suite</p>
        </div>
      </div>
    </div>
  );
}
