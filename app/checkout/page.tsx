"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, RefreshCw, Loader2, Plus } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

export default function CheckoutPage() {
  const { cart, total } = useCart();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  useEffect(() => {
    if (session?.user) {
        fetch("/api/user/addresses")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSavedAddresses(data);
                    // Pre-fill default if form is empty
                    const defaultAddr = data.find((a: any) => a.isDefault);
                    if (defaultAddr && !formData.address) {
                        selectAddress(defaultAddr);
                    }
                }
            })
            .catch(err => console.error("Failed to load addresses", err));
    }
  }, [session]);

  const selectAddress = (addr: any) => {
    const names = (session?.user?.name || "").split(" ");
    const uFirst = names[0] || "";
    const uLast = names.slice(1).join(" ") || "";

    setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || uFirst,
        lastName: prev.lastName || uLast,
        address: addr.line1,
        city: addr.city,
        state: addr.state || "",
        zipCode: addr.postal_code,
        country: addr.country,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          email: session?.user?.email || "",
          userId: (session?.user as any)?.id || "",
          shippingDetails: formData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const { id, url } = await res.json();
      
      // If Stripe returns a URL, we can redirect directly
      if (url) {
        window.location.href = url;
        return;
      }

      // Fallback to client-side redirection if URL is missing
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await (stripe as any).redirectToCheckout({ sessionId: id });
      } else {
        throw new Error("Stripe failed to load");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong with the checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0 && !isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header variant="white" />
        <div className="pt-40 pb-24 px-6 text-center">
          <h1 className="text-3xl font-serif mb-6">Your bag is empty</h1>
          <p className="text-zinc-500 mb-12">Add some items to your bag to proceed with checkout.</p>
          <Link 
            href="/" 
            className="inline-block px-12 py-4 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50/50">
      <Header variant="white" />
      
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Forms */}
            <div className="flex-1 space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400">
                  <Link href="/">Home</Link>
                  <ChevronRight size={10} />
                  <span className="text-black">Checkout</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-black">Checkout</h1>
              </header>

              {/* Saved Addresses Selection */}
              {/* Saved Addresses Selection */}
              {savedAddresses.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-500">Use a Saved Address</h3>
                        <Link href="/account?tab=addresses" className="text-[10px] uppercase tracking-widest underline decoration-zinc-300 underline-offset-4 hover:text-zinc-600 transition-colors">Manage</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map((addr) => {
                            const isSelected = formData.address === addr.line1 && formData.zipCode === addr.postal_code;
                            return (
                                <div 
                                    key={addr.id}
                                    onClick={() => selectAddress(addr)}
                                    className={`relative p-6 border rounded-xl cursor-pointer transition-all duration-300 ${
                                        isSelected
                                        ? "border-black bg-neutral-50 shadow-sm" 
                                        : "border-zinc-200 hover:border-zinc-400 bg-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-medium text-sm text-black truncate">{addr.line1}</h4>
                                        {addr.isDefault && (
                                            <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shrink-0">Default</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 font-light mb-1 truncate">{addr.city}, {addr.state} {addr.postal_code}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{addr.country === 'PH' ? 'Philippines' : addr.country === 'US' ? 'United States' : addr.country}</p>
                                    
                                    {/* Selection Indicator */}
                                    <div className={`absolute top-6 right-6 w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center transition-colors ${
                                        isSelected ? "border-black" : ""
                                    }`}>
                                        {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Option to use different/new address */}
                        <div 
                            onClick={() => setFormData(prev => ({ ...prev, address: "", city: "", state: "", zipCode: "", country: "US" }))}
                            className={`p-6 border rounded-xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                                !savedAddresses.some(a => a.line1 === formData.address) && !formData.address // Simple check, or just check empty
                                ? "border-black bg-neutral-50 shadow-sm" 
                                : "border-dashed border-zinc-300 hover:border-zinc-400 bg-transparent text-zinc-400 hover:text-black"
                            }`}
                        >
                            <Plus size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Enter New Address</span>
                        </div>
                    </div>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-12">
                {/* Shipping Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</span>
                    <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Shipping Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">First Name</label>
                      <input 
                        required
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John" 
                        className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">Last Name</label>
                      <input 
                        required
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe" 
                        className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">Address</label>
                    <input 
                      required
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street name and number" 
                      className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">City</label>
                      <input 
                        required
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York" 
                        className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">State</label>
                      <input 
                        required
                        type="text" 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="NY" 
                        className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">Zip Code</label>
                      <input 
                        required
                        type="text" 
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001" 
                        className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium ml-1">Phone</label>
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000" 
                      className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-xl text-sm focus:border-black outline-none transition-all shadow-xs"
                    />
                  </div>
                </section>

                {/* Payment Section */}
                <section className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                    <span className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold">2</span>
                    <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Payment Method</h2>
                  </div>
                  
                  <div className="p-6 bg-white border border-zinc-100 rounded-2xl flex items-center gap-4 shadow-xs">
                    <div className="w-5 h-5 rounded-full border-4 border-black shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Stripe (Credit/Debit Card)</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">Secure payment via Stripe</p>
                    </div>
                    <div className="flex gap-1">
                      {/* Placeholder for card icons */}
                      <div className="w-8 h-5 bg-zinc-100 rounded-sm" />
                      <div className="w-8 h-5 bg-zinc-100 rounded-sm" />
                      <div className="w-8 h-5 bg-zinc-100 rounded-sm" />
                    </div>
                  </div>
                </section>

                <div className="pt-6">
                  <button 
                    disabled={isLoading}
                    type="submit"
                    className="w-full lg:w-max px-16 bg-black text-white py-5 text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all duration-500 shadow-2xl active:scale-[0.98] rounded-full flex items-center justify-center gap-3 disabled:bg-zinc-400"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      "Confirm & Proceed to Pay"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[400px]">
              <div className="bg-white border border-zinc-100 rounded-3xl p-8 sticky top-32 space-y-8 shadow-sm">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold border-b border-zinc-50 pb-4">Order Summary</h2>
                
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-24 bg-zinc-50 rounded-xl overflow-hidden shrink-0">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1">
                        <h4 className="text-[11px] font-medium uppercase tracking-widest leading-tight line-clamp-2">{item.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                          <p className="text-xs font-semibold">${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-50">
                  <div className="flex justify-between text-zinc-500">
                    <span className="text-[10px] uppercase tracking-[0.2em]">Subtotal</span>
                    <span className="text-sm tracking-tight">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span className="text-[10px] uppercase tracking-[0.2em]">Shipping</span>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Complimentary</span>
                  </div>
                  <div className="flex justify-between pt-4 text-black border-t border-zinc-50">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Total</span>
                    <span className="text-xl font-medium tracking-tighter">${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-3 text-zinc-400 group">
                    <Truck size={16} className="group-hover:text-black transition-colors" />
                    <p className="text-[9px] uppercase tracking-widest leading-relaxed">Complimentary delivery within 3-5 business days</p>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 group">
                    <ShieldCheck size={16} className="group-hover:text-black transition-colors" />
                    <p className="text-[9px] uppercase tracking-widest leading-relaxed">Secure payment and data protection</p>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 group">
                    <RefreshCw size={16} className="group-hover:text-black transition-colors" />
                    <p className="text-[9px] uppercase tracking-widest leading-relaxed">Free returns within 30 days of receipt</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
