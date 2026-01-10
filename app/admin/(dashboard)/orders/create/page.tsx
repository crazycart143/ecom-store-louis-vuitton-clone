"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  X, 
  ArrowLeft,
  ChevronRight,
  User,
  Package,
  CreditCard,
  CheckCircle2,
  Clock,
  Trash2,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export default function CreateOrder() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsLoadingProducts(true);
      const timer = setTimeout(() => {
        fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setProducts(Array.isArray(data) ? data : []);
            setIsLoadingProducts(false);
          })
          .catch(() => setIsLoadingProducts(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProducts([]);
    }
  }, [searchQuery]);

  const addItem = (product: Product) => {
    const existing = selectedItems.find(item => item.productId === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        image: product.images?.[0]?.url || ""
      }]);
    }
    setShowProductSearch(false);
    setSearchQuery("");
    toast.success(`Added ${product.name} to order`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (status: 'DRAFT' | 'PAID' | 'PENDING') => {
    if (!email) return toast.error("Customer email is required");
    if (selectedItems.length === 0) return toast.error("Add at least one item to the order");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: selectedItems,
          total: calculateSubtotal(),
          status,
          fulfillment: "UNFULFILLED"
        }),
      });

      if (res.ok) {
        toast.success(status === 'DRAFT' ? "Draft order created" : "Order created successfully");
        router.push("/admin/orders");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
            href="/admin/orders"
            className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm"
        >
            <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-serif text-zinc-900 tracking-tight">Create New Order</h1>
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-black mt-1">Manual order entry system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Products & Items */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden ring-1 ring-black/5">
            <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                  <Package size={16} />
                </div>
                <h3 className="font-bold text-[15px]">Order Items</h3>
              </div>
              <button 
                onClick={() => setShowProductSearch(true)}
                className="text-[11px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:underline"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="min-h-[200px]">
              {selectedItems.length > 0 ? (
                <div className="divide-y divide-zinc-50">
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="p-8 flex items-center gap-6 group">
                      <div className="w-20 h-20 bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-black mb-1">{item.name}</p>
                        <p className="text-[12px] text-zinc-400 font-medium">${item.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-100">
                          <button 
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="text-zinc-400 hover:text-black transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-[13px] font-bold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="text-zinc-400 hover:text-black transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-4 text-zinc-300">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="text-[13px] font-medium italic">No items added to the order yet</p>
                  <button 
                    onClick={() => setShowProductSearch(true)}
                    className="mt-2 bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-black/10"
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Product Search Modal/Overlay */}
          {showProductSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-zinc-50 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search product name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium"
                    />
                  </div>
                  <button 
                    onClick={() => setShowProductSearch(false)}
                    className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-black"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {isLoadingProducts ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="animate-spin text-zinc-200" size={40} />
                      <p className="text-[12px] text-zinc-400 uppercase tracking-widest font-black">Scanning products...</p>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {products.map((product) => (
                        <button 
                          key={product.id}
                          onClick={() => addItem(product)}
                          className="flex items-center gap-4 p-4 hover:bg-zinc-50 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-14 h-14 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 shrink-0">
                            <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-black truncate">{product.name}</p>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">${product.price.toLocaleString()}</p>
                          </div>
                          <ChevronRight className="text-zinc-200 group-hover:text-black transition-colors" size={20} />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length > 1 ? (
                    <div className="py-20 text-center text-zinc-400 italic text-[13px]">No matching products found</div>
                  ) : (
                    <div className="py-20 text-center text-zinc-400 italic text-[13px]">Start typing to find products...</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Totals */}
        <div className="space-y-6">
          <section className="bg-white rounded-3xl border border-zinc-100 shadow-xl p-8 ring-1 ring-black/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <h3 className="font-bold text-[15px]">Customer Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                  <input 
                    type="email" 
                    placeholder="customer@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[13px] font-medium transition-all focus:bg-white focus:border-black outline-none"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                Manual orders will automatically search for existing accounts or create a guest record.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-zinc-100 shadow-xl p-8 ring-1 ring-black/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                <CreditCard size={16} />
              </div>
              <h3 className="font-bold text-[15px]">Payment Summary</h3>
            </div>

            <div className="space-y-3 pb-6 border-b border-zinc-50">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-500 font-medium tracking-tight">Subtotal ({selectedItems.length} items)</span>
                <span className="font-bold text-black">${calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-500 font-medium tracking-tight">Shipping</span>
                <span className="text-zinc-400 uppercase text-[10px] font-black underline cursor-pointer">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[14px] font-black uppercase tracking-widest text-black">Total Due</span>
              <span className="text-2xl font-serif text-black">${calculateSubtotal().toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              <button 
                disabled={isSubmitting || selectedItems.length === 0}
                onClick={() => handleSubmit('PAID')}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-black/10"
              >
                <CheckCircle2 size={16} /> Create & Pay
              </button>
              <button 
                disabled={isSubmitting || selectedItems.length === 0}
                onClick={() => handleSubmit('DRAFT')}
                className="w-full bg-white border border-zinc-200 text-zinc-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all disabled:opacity-50"
              >
                <Clock size={16} /> Save as Draft
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            className={`animate-spin ${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
