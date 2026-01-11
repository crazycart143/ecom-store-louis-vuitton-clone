"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  User,
  Calendar,
  DollarSign,
  Loader2,
  Printer,
  Trash2,
  Ban,
  Lock
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "STAFF";

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      // Fetch specific order directly
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        // Fallback or handle error
        const resList = await fetch("/api/orders");
        const dataList = await resList.json();
        const foundOrder = dataList.find((o: any) => o.id === orderId);
        setOrder(foundOrder);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = async () => {
    if (!order || order.status !== "DRAFT") return;
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PAID" }),
        });
        if (res.ok) {
            toast.success("Order finalized and payment collected");
            fetchOrder();
        } else {
            toast.error("Failed to finalize order");
        }
    } catch (error) {
        toast.error("An error occurred");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Order deleted successfully");
            router.push("/admin/orders");
        } else {
            toast.error("Failed to delete order");
            setIsProcessing(false);
        }
    } catch (error) {
        toast.error("An error occurred");
        setIsProcessing(false);
    }
  };

  const handleFulfill = async () => {
    if (!order || order.fulfillment === "DELIVERED") return;
    
    setFulfilling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillment: "DELIVERED" }),
      });

      if (res.ok) {
        // Refresh order data
        await fetchOrder();
        toast.success("Order fulfilled successfully!");
      } else {
        toast.error("Failed to fulfill order");
      }
    } catch (error) {
      console.error("Failed to fulfill order:", error);
      toast.error("Failed to fulfill order");
    } finally {
      setFulfilling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-zinc-300" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-8 text-center py-20">
        <Package className="mx-auto text-zinc-200" size={64} strokeWidth={1} />
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Order Not Found</h1>
          <p className="text-zinc-500 text-[13px] mt-2">
            The order you're looking for doesn't exist.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shippingAddress;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header (Admin UI) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-zinc-500 text-[13px] mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {order.status === 'DRAFT' ? (
              <div className="flex gap-3">
                {isStaff ? (
                  <div className="relative group">
                    <button 
                      disabled
                      className="bg-zinc-100 text-zinc-400 px-6 py-3 rounded-lg text-[13px] font-bold flex items-center gap-2 cursor-not-allowed border border-zinc-200"
                    >
                      <Lock size={16} />
                      Discard Draft
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl ring-1 ring-white/10">
                      Staff cannot delete draft records
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="bg-white border border-red-200 text-red-500 px-6 py-3 rounded-lg text-[13px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Discard Draft
                  </button>
                )}

                {isStaff ? (
                  <div className="relative group">
                    <button 
                      disabled
                      className="bg-zinc-100 text-zinc-400 px-8 py-3 rounded-xl text-[13px] font-black flex items-center gap-2 cursor-not-allowed border border-zinc-200"
                    >
                      <Lock size={16} />
                      Collect Payment
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl ring-1 ring-white/10">
                      Fiscal authorization required
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleFinalize}
                    disabled={isProcessing}
                    className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-[13px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-black/10"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
                    Collect Payment
                  </button>
                )}
              </div>
          ) : (
            <>
              <button 
                onClick={handlePrint}
                className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2"
              >
                <Printer size={16} />
                Print Order
              </button>
              <button 
                onClick={handleFulfill}
                disabled={order.fulfillment === "DELIVERED" || order.status === "CANCELLED" || fulfilling || isProcessing}
                className={`px-6 py-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
                  order.fulfillment === "DELIVERED" || order.status === "CANCELLED"
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                {fulfilling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Fulfilling...
                  </>
                ) : order.fulfillment === "DELIVERED" ? (
                  <>
                    <CheckCircle2 size={16} />
                    Already Fulfilled
                  </>
                ) : order.status === "CANCELLED" ? (
                   <>
                    <Ban size={16} />
                    Cancelled
                   </>
                ) : (
                  <>
                    <Truck size={16} />
                    Fulfill Order
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      {/* Print-Only Invoice Header */}
      <div className="hidden print:block border-b-2 border-black pb-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-2xl font-black tracking-[0.3em] mb-4">LOUIS VUITTON</div>
            <p className="text-[12px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              Official Store Receipt<br />
              Digital Boutique Division<br />
              Support: concierge@louisvuitton.com
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold uppercase tracking-[0.1em] mb-1">Invoice</h1>
            <p className="text-[14px] font-medium">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-[12px] text-zinc-500 mt-2">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 print:space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
            <div className="p-6 border-b border-zinc-100 print:px-0 print:pt-0">
              <h2 className="font-bold text-lg print:text-sm print:uppercase print:tracking-widest">Order Items</h2>
            </div>
            <div className="divide-y divide-zinc-50 print:divide-zinc-200">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="p-6 flex gap-4 print:px-0 print:py-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 print:w-16 print:h-16">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[14px] print:text-[13px]">{item.name}</h3>
                    <p className="text-[12px] text-zinc-500 mt-1 print:text-[11px]">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-[12px] text-zinc-500 print:hidden">
                      ${item.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[14px] print:text-[13px]">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-2 print:bg-white print:px-0 print:border-zinc-200">
              <div className="flex justify-between text-[13px] print:text-[12px]">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">${(order.subtotal || order.total).toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[13px] print:text-[12px] text-red-600">
                  <span className="text-zinc-600">Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                  <span className="font-medium">-${order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] print:text-[12px]">
                <span className="text-zinc-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-zinc-200 print:text-[14px]">
                <span>Total Amount paid</span>
                <span>${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 print:border-none print:shadow-none print:p-0">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 print:text-sm print:uppercase print:tracking-widest print:mb-2">
                <MapPin size={20} className="print:hidden" />
                Shipping Details
              </h2>
              {shippingAddr && (shippingAddr.line1 || shippingAddr.city) ? (
                <div className="text-[13px] text-zinc-600 space-y-1 print:text-[12px]">
                  {shippingAddr.name && <p className="font-bold text-black text-[14px] print:text-[13px]">{shippingAddr.name}</p>}
                  {shippingAddr.line1 && <p className="font-medium text-black">{shippingAddr.line1}</p>}
                  {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                  {(shippingAddr.city || shippingAddr.state || shippingAddr.postal_code) && (
                    <p>
                      {[shippingAddr.city, shippingAddr.state, shippingAddr.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {shippingAddr.country && <p>{shippingAddr.country}</p>}
                </div>
              ) : (
                <div className="text-[13px] text-zinc-400 italic">
                  <p>Shipping address not provided</p>
                </div>
              )}
            </div>

            {/* Customer Info (Visible in Print) */}
            <div className="hidden print:block">
               <h2 className="font-bold text-sm uppercase tracking-widest mb-2">Customer Info</h2>
               <div className="text-[12px] text-zinc-600 space-y-1">
                 <p><span className="font-medium text-black">Email:</span> {order.email}</p>
                 <p><span className="font-medium text-black">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                 <p><span className="font-medium text-black">Payment:</span> {order.status}</p>
               </div>
            </div>
          </div>
          
          {/* Print Footer */}
          <div className="hidden print:block pt-12 mt-12 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-medium">Thank you for shopping with Louis Vuitton</p>
            <p className="text-[9px] text-zinc-300 mt-2">This is a system generated document. No signature required.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 print:hidden">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg">Order Status</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-600">Payment</span>
                <span
                  className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                    order.status === "PAID"
                      ? "bg-green-50 text-green-600"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {order.status === "PAID" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {order.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-zinc-600">Fulfillment</span>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                    order.fulfillment === "DELIVERED"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {order.fulfillment || "Unfulfilled"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <User size={20} />
              Customer
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-[13px] font-medium break-all">{order.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                    Order Date
                  </p>
                  <p className="text-[13px] font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 print:hidden">
            <h2 className="font-bold text-lg mb-6">Timeline</h2>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-200 before:via-zinc-100 before:to-transparent">
              
              {/* Event: Order Placed */}
              <div className="relative flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-zinc-100">
                  <Package size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[13px] font-bold text-zinc-900">Order Placed</p>
                    <time className="text-[10px] text-zinc-400 font-mono">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Order was received from {order.email}</p>
                </div>
              </div>

              {/* Event: Payment */}
              <div className="relative flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-zinc-100 ${order.status === 'PAID' ? 'bg-green-500' : 'bg-zinc-100'}`}>
                  <DollarSign size={14} className={order.status === 'PAID' ? 'text-white' : 'text-zinc-400'} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                    <p className="text-[13px] font-bold text-zinc-900">Payment Status</p>
                    <time className="text-[10px] text-zinc-400 font-mono">
                      {order.status === 'PAID' ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </time>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {order.status === 'PAID' ? 'Payment was successfully captured via Stripe' : 'Waiting for customer to complete payment'}
                  </p>
                </div>
              </div>

               {/* Event: Notification (Portfolio Polish) */}
               <div className="relative flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-zinc-100">
                  <Mail size={14} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[13px] font-bold text-zinc-900 font-sans">Staff Action</p>
                    <span className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Auto</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Confirmation email sent to {order.email}</p>
                </div>
              </div>

              {/* Event: Fulfillment */}
              <div className="relative flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ring-1 ring-zinc-100 ${order.fulfillment === 'DELIVERED' ? 'bg-black' : 'bg-zinc-100'}`}>
                  <Truck size={14} className={order.fulfillment === 'DELIVERED' ? 'text-white' : 'text-zinc-400'} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                    <p className="text-[13px] font-bold text-zinc-900">Fulfillment</p>
                    {order.fulfillment === 'DELIVERED' && (
                        <time className="text-[10px] text-zinc-400 font-mono">Recently</time>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {order.fulfillment === 'DELIVERED' ? 'Order has been picked, packed and shipped' : 'Items are ready for fulfillment'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
