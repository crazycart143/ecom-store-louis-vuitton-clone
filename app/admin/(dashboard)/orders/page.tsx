"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((o: any) => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Track and manage customer orders and fulfillment.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all">
            Draft Orders
          </button>
          <button className="bg-black text-white px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all">
            Create Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-3 rounded-xl w-full md:w-96 border border-zinc-100">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by order ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 border border-zinc-200 rounded-xl text-[13px] hover:bg-zinc-50 transition-all font-medium">
              <Calendar size={16} />
              Last 30 days
            </button>
            <button className="flex items-center gap-2 px-4 py-3 border border-zinc-200 rounded-xl text-[13px] hover:bg-zinc-50 transition-all font-medium">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-left">Order</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Payment Status</th>
                  <th className="px-6 py-4 text-left">Fulfillment</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-sans">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4 text-[13px] font-bold">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-600">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-black">{order.email.split('@')[0]}</p>
                      <p className="text-[11px] text-zinc-400">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                        order.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {order.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                        order.fulfillment === 'FULFILLED' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {order.fulfillment || 'Unfulfilled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-black">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-300 hover:text-black transition-colors inline-block"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="py-32 text-center">
            <ShoppingBag className="mx-auto text-zinc-100 mb-4" size={64} strokeWidth={1} />
            <h3 className="text-lg font-medium text-zinc-900">No orders found</h3>
            <p className="text-zinc-500 text-[13px]">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
