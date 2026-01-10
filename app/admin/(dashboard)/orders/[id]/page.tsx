"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Printer
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const foundOrder = data.find((o: any) => o.id === orderId);
      setOrder(foundOrder);
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

  const handleFulfill = async () => {
    if (!order || order.fulfillment === "FULFILLED") return;
    
    setFulfilling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/fulfill`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Refresh order data
        await fetchOrder();
        alert("Order fulfilled successfully!");
      } else {
        alert("Failed to fulfill order");
      }
    } catch (error) {
      console.error("Failed to fulfill order:", error);
      alert("Failed to fulfill order");
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
      {/* Header */}
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
          <button 
            onClick={handlePrint}
            className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2"
          >
            <Printer size={16} />
            Print Order
          </button>
          <button 
            onClick={handleFulfill}
            disabled={order.fulfillment === "FULFILLED" || fulfilling}
            className={`px-6 py-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 ${
              order.fulfillment === "FULFILLED"
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-zinc-800"
            }`}
          >
            {fulfilling ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Fulfilling...
              </>
            ) : order.fulfillment === "FULFILLED" ? (
              <>
                <CheckCircle2 size={16} />
                Already Fulfilled
              </>
            ) : (
              <>
                <Truck size={16} />
                Fulfill Order
              </>
            )}
          </button>
        </div>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold">Order #{order.id.slice(-6).toUpperCase()}</h1>
        <p className="text-zinc-600 mt-2">
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="font-bold text-lg">Order Items</h2>
            </div>
            <div className="divide-y divide-zinc-50">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="p-6 flex gap-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
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
                    <h3 className="font-medium text-[14px]">{item.name}</h3>
                    <p className="text-[12px] text-zinc-500 mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      ${item.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[14px]">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">${order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-zinc-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-zinc-200">
                <span>Total</span>
                <span>${order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Shipping Address
            </h2>
            {shippingAddr && (shippingAddr.line1 || shippingAddr.city) ? (
              <div className="text-[13px] text-zinc-600 space-y-1">
                {shippingAddr.name && <p className="font-bold text-black text-[14px]">{shippingAddr.name}</p>}
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
                <p className="text-[11px] mt-1">
                  This may occur if the customer didn't provide shipping details during checkout.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                    order.fulfillment === "FULFILLED"
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
            <h2 className="font-bold text-lg mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">Order Placed</p>
                  <p className="text-[11px] text-zinc-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.status === "PAID" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <DollarSign size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">Payment Confirmed</p>
                    <p className="text-[11px] text-zinc-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {order.fulfillment === "FULFILLED" ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">Order Fulfilled</p>
                    <p className="text-[11px] text-zinc-500">
                      {order.fulfilledAt ? new Date(order.fulfilledAt).toLocaleString() : "Recently"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">Awaiting Fulfillment</p>
                    <p className="text-[11px] text-zinc-500">Pending</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
