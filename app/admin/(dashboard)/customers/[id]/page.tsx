"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  User, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  Loader2,
  Package,
  History,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/admin/customers/${customerId}`);
        if (res.ok) {
            const data = await res.json();
            setCustomer(data);
        } else {
            toast.error("Failed to load customer details");
            // router.push("/admin/customers");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="text-zinc-200 mb-4" size={64} strokeWidth={1} />
        <h2 className="text-xl font-bold text-zinc-900">Customer Not Found</h2>
        <Link href="/admin/customers" className="mt-4 text-sm text-zinc-500 hover:text-black underline underline-offset-4">
            Return to customers list
        </Link>
      </div>
    );
  }

  const totalSpent = customer.orders?.reduce((acc: number, order: any) => acc + (order.total || 0), 0) || 0;
  const averageOrder = customer.orders?.length ? totalSpent / customer.orders.length : 0;
  const lastActive = customer.lastActive ? new Date(customer.lastActive).toLocaleDateString() : (customer.orders?.[0]?.createdAt ? new Date(customer.orders[0].createdAt).toLocaleDateString() : "Never");
  const shippingAddress = customer.orders?.[0]?.shippingAddress; // Take latest from most recent order

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                {customer.name}
            </h1>
            <p className="text-zinc-500 text-[13px] mt-1 flex items-center gap-2">
                Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                 customer.role === 'ADMIN' || customer.role === 'OWNER' 
                 ? 'bg-purple-50 text-purple-700 border-purple-100' 
                 : customer.role === 'STAFF'
                 ? 'bg-blue-50 text-blue-700 border-blue-100'
                 : 'bg-zinc-100 text-zinc-500 border-zinc-200'
             }`}>
                {customer.role}
             </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Profile */}
        <div className="space-y-6">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-zinc-100">
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Total Spent</p>
                    <p className="text-2xl font-bold text-black">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-100">
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-2">Orders</p>
                    <p className="text-2xl font-bold text-black">{customer.orders?.length || 0}</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6">
                <h3 className="font-bold text-[14px] uppercase tracking-widest border-b border-zinc-50 pb-4">Profile Details</h3>
                
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Mail size={16} className="text-zinc-400 mt-0.5" />
                        <div>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">Email</p>
                            <p className="text-[13px] select-all">{customer.email}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <ClockIconWrapper />
                        <div>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">Last Active</p>
                            <p className="text-[13px]">{lastActive}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                         <ShieldCheck size={16} className="text-zinc-400 mt-0.5" />
                         <div>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">Account Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="text-[13px]">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Card (Inferred from latest order) */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6">
                 <h3 className="font-bold text-[14px] uppercase tracking-widest border-b border-zinc-50 pb-4">Default Address</h3>
                 {shippingAddress ? (
                     <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-zinc-400 mt-0.5" />
                        <div className="text-[13px] leading-relaxed text-zinc-600">
                            <p className="font-medium text-black">{shippingAddress.name}</p>
                            <p>{shippingAddress.line1}</p>
                            {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                            <p>{shippingAddress.city}, {shippingAddress.state}, {shippingAddress.postal_code}</p>
                            <p>{shippingAddress.country}</p>
                        </div>
                     </div>
                 ) : (
                     <p className="text-[13px] text-zinc-400 italic">No address history found.</p>
                 )}
            </div>

        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
             <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
                    <h3 className="font-bold text-[14px] uppercase tracking-widest">Order History</h3>
                    <span className="text-[11px] text-zinc-400">
                      {customer.orders?.length > 0 
                        ? `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, customer.orders.length)}-${Math.min(currentPage * ITEMS_PER_PAGE, customer.orders.length)} of ${customer.orders.length} orders`
                        : "No orders found"}
                    </span>
                </div>
                
                {customer.orders && customer.orders.length > 0 ? (
                    <>
                    <div className="divide-y divide-zinc-50">
                        {customer.orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((order: any) => (
                            <Link 
                                href={`/admin/orders/${order._id}`}
                                key={order._id} 
                                className="block p-4 hover:bg-zinc-50 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-200 transition-colors">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-black group-hover:text-blue-600 transition-colors">
                                                #{order._id.substring(order._id.length - 6).toUpperCase()}
                                            </p>
                                            <p className="text-[11px] text-zinc-500">
                                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="hidden md:block text-right">
                                            <p className="text-[13px] font-bold text-black">${order.total?.toLocaleString()}</p>
                                            {order.items?.length > 0 && (
                                                <p className="text-[10px] text-zinc-400">{order.items.length} items</p>
                                            )}
                                        </div>

                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest min-w-[80px] text-center border ${
                                            order.status === 'PAID' 
                                            ? 'bg-green-50 text-green-700 border-green-100' 
                                            : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {customer.orders.length > ITEMS_PER_PAGE && (
                        <div className="p-4 border-t border-zinc-50 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-[12px] font-medium text-zinc-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-[12px] text-zinc-400 font-medium">Page {currentPage} of {Math.ceil(customer.orders.length / ITEMS_PER_PAGE)}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(customer.orders.length / ITEMS_PER_PAGE)))}
                                disabled={currentPage === Math.ceil(customer.orders.length / ITEMS_PER_PAGE)}
                                className="px-4 py-2 text-[12px] font-medium text-zinc-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <Package className="mx-auto text-zinc-200 mb-4" size={48} strokeWidth={1} />
                        <p className="text-[13px] text-zinc-400 font-medium">No orders yet</p>
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
}

function ClockIconWrapper() {
    return <History size={16} className="text-zinc-400 mt-0.5" />;
}
