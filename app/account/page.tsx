"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Package, LogOut, ChevronRight, Loader2, User, MapPin, CreditCard, ShoppingBag, Plus, X, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";


// --- Main Component ---
export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("orders");

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['orders', 'profile', 'addresses', 'payment'].includes(tab)) {
        setActiveTab(tab);
    }
  }, [searchParams]);
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();

  // Orders State
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({ line1: "", line2: "", city: "", state: "", postal_code: "", country: "US", isDefault: false });

  // Pagination State
  const [orderPage, setOrderPage] = useState(1);
  const [addressPage, setAddressPage] = useState(1);
  const ITEMS_PER_PAGE = 5;



  // Password State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // --- Fetch Data ---
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) {
      // Fetch Orders
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setOrders(data) : setOrders([]))
        .catch(console.error);
      // Fetch Addresses
      fetch("/api/user/addresses")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setAddresses(data) : setAddresses([]))
        .catch(console.error);

      
      setLoading(false);
    }
  }, [status, session, router]);

  // --- Handlers ---
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };

  const handleAddAddress = async (e: FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetch("/api/user/addresses", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newAddress)
          });
          if (res.ok) {
              const saved = await res.json();
              if (saved.isDefault) {
                  // If new one is default, update local state for others
                   setAddresses(prev => [...prev.map(a => ({...a, isDefault: false})), saved]);
              } else {
                   setAddresses([...addresses, saved]);
              }
              setIsAddingAddress(false);
              setNewAddress({ line1: "", line2: "", city: "", state: "", postal_code: "", country: "US", isDefault: false });
              toast.success("Address added");
          }
      } catch (err) {
          toast.error("Failed to add address");
      }
  };

  const handleDeleteAddress = (id: string) => {
      setDeleteAddressId(id);
  };

  const confirmDeleteAddress = async () => {
      if (!deleteAddressId) return;
      try {
        const res = await fetch(`/api/user/addresses?id=${deleteAddressId}`, { method: "DELETE" });
        if (res.ok) {
            setAddresses(addresses.filter(a => a.id !== deleteAddressId));
            toast.success("Address removed");
        } else {
            toast.error("Failed to remove address");
        }
      } catch (error) {
          toast.error("An error occurred");
      }
      setDeleteAddressId(null);
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          toast.error("New passwords do not match");
          return;
      }
      const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      });
      const data = await res.json();
      if (res.ok) {
          toast.success("Password updated");
          setIsEditingPassword(false);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
          toast.error(data.error || "Failed to update password");
      }
  };



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

  ];

  return (
    <main className="min-h-screen bg-stone-50/30">
      <Header variant="white" />
      
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="mb-10">
              <h1 className="text-2xl font-serif mb-1 uppercase tracking-widest">My Account</h1>
              <p className="text-[10px] text-zinc-400 font-light uppercase tracking-widest">{session?.user?.name || "Member"}</p>
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
                  onClick={() => { clearCart(); clearWishlist(); signOut({ callbackUrl: "/" }); }}
                  className="w-full flex items-center gap-4 px-4 py-4 text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 shadow-sm min-h-[600px]">
            
            {/* --- ORDERS TAB --- */}
            {activeTab === "orders" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
                  <ShoppingBag size={18} /> Recent Orders
                </h2>
                {orders.length === 0 ? (
                  <div className="py-20 text-center">
                    <Package className="mx-auto mb-6 text-zinc-200" size={48} strokeWidth={1} />
                    <p className="text-[14px] text-zinc-500 font-light mb-8">You haven't placed any orders yet.</p>
                    <button onClick={() => router.push("/")} className="px-8 py-4 bg-black text-white text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-all font-luxury">Start Shopping</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-zinc-100 text-[10px] uppercase tracking-widest text-zinc-400 font-medium px-4">
                    <div className="col-span-3">Order</div>
                    <div className="col-span-4">Shipped To</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-2 text-right">Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="space-y-0">
                    {orders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE).map((order: any) => {
                      const isExpanded = expandedOrders.includes(order.id);
                      return (
                        <div key={order.id} className="border-b border-zinc-100 last:border-0">
                          {/* Main Row */}
                          <div 
                            onClick={() => toggleOrderDetails(order.id)}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 items-center cursor-pointer group transition-colors hover:bg-zinc-50 px-4 rounded-sm"
                          >
                            <div className="col-span-1 md:col-span-3">
                                <p className="font-serif text-lg text-black">#{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="col-span-1 md:col-span-4 hidden md:block">
                                {order.shippingAddress ? (
                                    <div className="pr-4">
                                        <p className="text-sm font-medium truncate text-black">{order.shippingAddress.line1}</p>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.country}</p>
                                    </div>
                                ) : (
                                    <span className="text-xs text-zinc-300 italic">No address</span>
                                )}
                            </div>

                            <div className="col-span-1 md:col-span-2 text-left md:text-right">
                                <p className="text-sm font-medium text-black">${order.total.toLocaleString()}</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 text-left md:text-right">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                    order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'PAID' ? 'bg-green-600' : 'bg-zinc-400'}`}></span>
                                    {order.status}
                                </span>
                            </div>

                            <div className="col-span-1 md:col-span-1 flex justify-end">
                                <ChevronRight className={`text-zinc-300 group-hover:text-black transition-all duration-300 ${isExpanded ? 'rotate-90' : ''}`} size={16} />
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-4 pb-8 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-4 border-t border-zinc-100 pt-8">
                                    {/* Product List - Aligns with first columns */}
                                    <div className="col-span-1 md:col-span-6">
                                        <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Items Ordered</h4>
                                        <div className="space-y-3">
                                          {order.items?.map((item: any, idx: number) => (
                                              <div key={idx} className="flex gap-4 items-center bg-white p-3 border border-zinc-100 rounded-sm hover:border-zinc-300 transition-colors">
                                                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                                      {item.image ? (
                                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                      ) : (
                                                          <ShoppingBag size={14} className="text-zinc-300" />
                                                      )}
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                      <p className="text-sm font-medium truncate text-black mb-1">{item.name}</p>
                                                      <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                                  </div>
                                                  <p className="text-sm font-medium text-black">${item.price.toLocaleString()}</p>
                                              </div>
                                          ))}
                                        </div>
                                    </div>
                                    
                                    {/* Address - Aligns with Ship To roughly */}
                                    <div className="col-span-1 md:col-start-8 md:col-span-5">
                                        <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Delivery Details</h4>
                                        {order.shippingAddress ? (
                                            <div className="bg-zinc-50 p-6 rounded-sm border border-zinc-100">
                                                <div className="text-sm text-zinc-600 space-y-1.5 font-light">
                                                    <p className="font-medium text-black mb-3">{session?.user?.name}</p>
                                                    <p>{order.shippingAddress.line1}</p>
                                                    {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}</p>
                                                    <p className="mt-3 text-xs uppercase tracking-wider text-zinc-400 font-bold">{order.shippingAddress.country}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-zinc-400 italic">No shipping details provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                {orders.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-6 mt-8 pt-6 border-t border-zinc-50">
                        <button 
                            disabled={orderPage === 1} 
                            onClick={() => setOrderPage(p => p - 1)} 
                            className="text-[10px] uppercase tracking-widest disabled:opacity-20 hover:text-zinc-600 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] text-zinc-400 font-medium">Page {orderPage} of {Math.ceil(orders.length / ITEMS_PER_PAGE)}</span>
                        <button 
                            disabled={orderPage === Math.ceil(orders.length / ITEMS_PER_PAGE)} 
                            onClick={() => setOrderPage(p => p + 1)} 
                            className="text-[10px] uppercase tracking-widest disabled:opacity-20 hover:text-zinc-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
                  </div>
                )}
              </section>
            )}

            {/* --- PROFILE TAB --- */}
            {activeTab === "profile" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black mb-10 pb-4 border-b border-zinc-100 flex items-center gap-3">
                  <User size={18} /> Personal Information
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
                    {!isEditingPassword ? (
                       <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                         <p className="text-[15px]">••••••••••••</p>
                         <button onClick={() => setIsEditingPassword(true)} className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black hover:underline">Edit</button>
                       </div>
                    ) : (
                        <form onSubmit={handlePasswordUpdate} className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 space-y-4">
                            <input type="password" placeholder="Current Password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full bg-white border border-zinc-200 p-3 text-sm focus:outline-black" />
                            <input type="password" placeholder="New Password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-white border border-zinc-200 p-3 text-sm focus:outline-black" />
                            <input type="password" placeholder="Confirm New Password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-white border border-zinc-200 p-3 text-sm focus:outline-black" />
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest">Save</button>
                                <button type="button" onClick={() => setIsEditingPassword(false)} className="text-zinc-500 px-4 py-2 text-xs uppercase tracking-widest">Cancel</button>
                            </div>
                        </form>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* --- ADDRESSES TAB --- */}
            {activeTab === "addresses" && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-100">
                  <h2 className="text-[14px] uppercase tracking-[0.3em] font-medium text-black flex items-center gap-3"><MapPin size={18} /> Address Book</h2>
                  <button onClick={() => setIsAddingAddress(true)} className="text-[10px] uppercase tracking-widest font-medium underline underline-offset-4 flex items-center gap-2"><Plus size={14} /> Add New</button>
                </div>
                
                {isAddingAddress && (
                    <form onSubmit={handleAddAddress} className="mb-10 bg-zinc-50 p-6 rounded-lg border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><h3 className="text-xs uppercase tracking-widest mb-4 font-bold">New Address</h3></div>
                        <input placeholder="Address Line 1" required value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} className="border p-3 text-sm" />
                        <input placeholder="Address Line 2 (Optional)" value={newAddress.line2} onChange={e => setNewAddress({...newAddress, line2: e.target.value})} className="border p-3 text-sm" />
                        <input placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="border p-3 text-sm" />
                        <input placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="border p-3 text-sm" />
                        <input placeholder="Postal Code" required value={newAddress.postal_code} onChange={e => setNewAddress({...newAddress, postal_code: e.target.value})} className="border p-3 text-sm" />
                        <div className="relative">
                            <select 
                                required 
                                value={newAddress.country} 
                                onChange={e => setNewAddress({...newAddress, country: e.target.value})} 
                                className="w-full border border-zinc-200 p-3 text-sm appearance-none bg-white text-black focus:outline-black transition-colors rounded-sm"
                            >
                                <option value="US">United States</option>
                                <option value="PH">Philippines</option>
                                <option value="CA">Canada</option>
                                <option value="GB">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="FR">France</option>
                                <option value="DE">Germany</option>
                                <option value="IT">Italy</option>
                                <option value="ES">Spain</option>
                                <option value="JP">Japan</option>
                                <option value="SG">Singapore</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-zinc-400" size={14} />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                             <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} />
                             <label htmlFor="isDefault" className="text-sm">Set as default address</label>
                        </div>
                        <div className="md:col-span-2 flex gap-3 pt-4">
                            <button type="submit" className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest">Save Address</button>
                            <button type="button" onClick={() => setIsAddingAddress(false)} className="text-zinc-500 px-6 py-3 text-xs uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.slice((addressPage - 1) * ITEMS_PER_PAGE, addressPage * ITEMS_PER_PAGE).map((addr) => (
                      <div key={addr.id} className="border border-zinc-200 p-8 relative hover:border-black transition-colors">
                        {addr.isDefault && <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest bg-black text-white px-2 py-1">Default</span>}
                        <h3 className="text-[12px] uppercase tracking-widest font-bold mb-4">{addr.country}</h3>
                        <p className="text-[14px] leading-relaxed text-zinc-600">
                          {addr.line1}<br />
                          {addr.line2 && <>{addr.line2}<br /></>}
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        <div className="mt-8 flex gap-4">
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={12}/> Remove</button>
                        </div>
                      </div>
                  ))}
                  {addresses.length === 0 && !isAddingAddress && (
                      <div className="md:col-span-2 py-10 text-center text-zinc-400 text-sm">No addresses saved.</div>
                  )}
                </div>
                {addresses.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-6 mt-8 pt-6 border-t border-zinc-50">
                        <button 
                            disabled={addressPage === 1} 
                            onClick={() => setAddressPage(p => p - 1)} 
                            className="text-[10px] uppercase tracking-widest disabled:opacity-20 hover:text-zinc-600 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] text-zinc-400 font-medium">Page {addressPage} of {Math.ceil(addresses.length / ITEMS_PER_PAGE)}</span>
                        <button 
                            disabled={addressPage === Math.ceil(addresses.length / ITEMS_PER_PAGE)} 
                            onClick={() => setAddressPage(p => p + 1)} 
                            className="text-[10px] uppercase tracking-widest disabled:opacity-20 hover:text-zinc-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
              </section>
            )}



          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* --- Delete Confirmation Modal --- */}
      {deleteAddressId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white p-8 max-w-md w-full shadow-xl transform transition-all animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-serif mb-4">Confirm Deletion</h3>
                <p className="text-sm text-zinc-600 mb-8 leading-relaxed">
                    Are you sure you want to delete this address? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                    <button 
                        onClick={() => setDeleteAddressId(null)}
                        className="text-zinc-500 px-6 py-3 text-xs uppercase tracking-widest hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDeleteAddress}
                        className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}
