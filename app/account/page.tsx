"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Package, LogOut, ChevronRight, Loader2, User, MapPin, CreditCard, Settings, ShoppingBag } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "profile", label: "Personal Info", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
  ];

  return (
    <main className="min-h-screen bg-stone-50/30">
      <Header variant="white" />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="mb-10">
              <h1 className="text-2xl font-serif mb-1 uppercase tracking-widest">My Account</h1>
              <p className="text-[12px] text-zinc-400 font-light uppercase tracking-widest">
                {session?.user?.name || "Member"}
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-[11px] uppercase tracking-[0.2em] transition-all border-l-2 ${
                    activeTab === tab.id 
                    ? "bg-white border-black text-black font-medium" 
                    : "border-transparent text-zinc-400 hover:text-black hover:bg-white/50"
                  }`}
                >
                  <tab.icon size={16} strokeWidth={1.5} />
                  {tab.label}
                </button>
              ))}
              
              <div className="mt-8 pt-8 border-t border-zinc-100">
                <button
                  onClick={() => {
                    clearCart();
                    clearWishlist();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-4 px-4 py-4 text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 shadow-sm min-h-[600px]">
            
            {activeTab === "orders" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
                  <ShoppingBag size={18} />
                  Recent Orders
                </h2>
                
                {orders.length === 0 ? (
                  <div className="py-20 text-center">
                    <Package className="mx-auto mb-6 text-zinc-200" size={48} strokeWidth={1} />
                    <p className="text-[14px] text-zinc-500 font-light mb-8">You haven't placed any orders yet.</p>
                    <button 
                      onClick={() => router.push("/")}
                      className="px-8 py-4 bg-black text-white text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-all font-luxury"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => (
                      <div key={order.id} className="group border border-zinc-100 p-8 hover:border-zinc-300 transition-all">
                        <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Reference</p>
                            <p className="text-[14px] font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Order Date</p>
                            <p className="text-[14px]">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Amount</p>
                            <p className="text-[14px] font-medium">${order.total.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Status</p>
                            <span className={`text-[10px] py-1 inline-block uppercase tracking-widest font-bold ${
                              order.status === 'PAID' ? 'text-green-600' : 'text-zinc-500'
                            }`}>
                              ● {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-zinc-50 pt-6">
                          <div className="flex gap-2">
                            {/* In a real app, show order item thumbnails here */}
                            <p className="text-[12px] text-zinc-500">{order.items?.length || 0} items in this order</p>
                          </div>
                          <button className="text-[10px] uppercase tracking-widest font-medium flex items-center gap-2 hover:translate-x-1 transition-all">
                            View details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "profile" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
                  <User size={18} />
                  Personal Information
                </h2>
                
                <div className="max-w-xl space-y-10">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Full Name</label>
                    <p className="text-[15px] pb-4 border-b border-zinc-100">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Email Address</label>
                    <p className="text-[15px] pb-4 border-b border-zinc-100">{session?.user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-400 mb-3">Password</label>
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                      <p className="text-[15px]">••••••••••••</p>
                      <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black">Edit</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "addresses" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-100">
                  <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black flex items-center gap-3">
                    <MapPin size={18} />
                    Address Book
                  </h2>
                  <button className="text-[10px] uppercase tracking-widest font-medium underline underline-offset-4">
                    Add New
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-black p-8 relative">
                    <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest bg-black text-white px-2 py-1">Default</span>
                    <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4">Billing & Shipping</h3>
                    <p className="text-[14px] leading-relaxed text-zinc-600">
                      {session?.user?.name}<br />
                      123 Luxury Lane<br />
                      Suite 500<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                    <div className="mt-8 flex gap-4">
                      <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black">Edit</button>
                      <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black">Remove</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "payment" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
                  <CreditCard size={18} />
                  Payment Methods
                </h2>
                
                <div className="py-20 text-center border border-dashed border-zinc-200">
                  <CreditCard className="mx-auto mb-6 text-zinc-200" size={48} strokeWidth={1} />
                  <p className="text-[14px] text-zinc-500 font-light mb-8">No saved payment methods.</p>
                  <button className="px-8 py-4 border border-black text-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all font-luxury">
                    Add Credit Card
                  </button>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
