"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  PackageCheck,
  Ban,
  X
} from "lucide-react";

export default function AdminOrders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeSegment, setActiveSegment] = useState("all");
  
  // Batch Mode State
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Advanced Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filteredOrders = orders
    .filter((o: any) => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((o: any) => {
        if (activeSegment === "all") return true;
        if (activeSegment === "draft") return o.status === "DRAFT";
        if (activeSegment === "paid") return o.status === "PAID";
        if (activeSegment === "pending") return o.status === "PENDING";
        if (activeSegment === "fulfilled") return o.fulfillment === "FULFILLED";
        if (activeSegment === "unfulfilled") return o.fulfillment === "UNFULFILLED" || !o.fulfillment;
        return true;
    })
    .filter((o: any) => {
        if (minAmount && o.total < parseFloat(minAmount)) return false;
        if (maxAmount && o.total > parseFloat(maxAmount)) return false;
        if (startDate && new Date(o.createdAt) < new Date(startDate)) return false;
        if (endDate && new Date(o.createdAt) > new Date(endDate)) return false;
        return true;
    });

  const toggleSelectOrder = (id: string) => {
    const next = new Set(selectedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrders(next);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleBatchAction = async (action: string) => {
    setIsProcessingBatch(true);
    const orderIds = Array.from(selectedOrders);
    
    try {
        const response = await fetch("/api/admin/orders/batch", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderIds, action }),
        });

        if (response.ok) {
            toast.success(`Successfully processed ${orderIds.length} orders`);
            fetchOrders(); // Refresh the list
            setSelectedOrders(new Set());
        } else {
            const data = await response.json();
            toast.error(data.error || "Failed to process batch action");
        }
    } catch (error) {
        toast.error("An error occurred during batch update");
    } finally {
        setIsProcessingBatch(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Orders</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Track and manage customer orders and fulfillment.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => setActiveSegment("draft")}
            className={`bg-white border border-zinc-200 text-black px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all ${activeSegment === 'draft' ? 'ring-2 ring-black border-black' : ''}`}
          >
            Draft Orders
          </button>
          <Link 
            href="/admin/orders/create"
            className="bg-black text-white px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all flex items-center justify-center"
          >
            Create Order
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
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
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold border transition-all ${
                        showFilters ? "bg-black text-white border-black" : "bg-white text-zinc-600 border-zinc-200 hover:border-black"
                    }`}
                >
                    <Filter size={16} /> Filters
                </button>
                <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                    {[
                    { id: "all", label: "All" },
                    { id: "draft", label: "Drafts" },
                    { id: "paid", label: "Paid" },
                    { id: "unfulfilled", label: "To Ship" }
                    ].map((segment) => (
                    <button 
                        key={segment.id}
                        onClick={() => setActiveSegment(segment.id)}
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all uppercase tracking-widest ${
                            activeSegment === segment.id ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"
                        }`}
                    >
                        {segment.label}
                    </button>
                    ))}
                </div>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 animate-in slide-in-from-top-2">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Min Value</label>
                    <input 
                        type="number" 
                        value={minAmount} 
                        onChange={(e) => setMinAmount(e.target.value)} 
                        className="w-full bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg text-[13px]" 
                        placeholder="$0.00"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Max Value</label>
                    <input 
                        type="number" 
                        value={maxAmount} 
                        onChange={(e) => setMaxAmount(e.target.value)} 
                        className="w-full bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg text-[13px]" 
                        placeholder="$10,000+"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="w-full bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-lg text-[13px]" 
                    />
                </div>
                <div className="flex items-end pb-1 gap-2">
                    <button 
                        onClick={() => {
                            setMinAmount(""); setMaxAmount(""); setStartDate(""); setEndDate("");
                        }}
                        className="text-[11px] font-bold text-red-500 hover:underline uppercase tracking-widest ml-auto"
                    >
                        Reset
                    </button>
                </div>
              </div>
          )}
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
                  <th className="px-6 py-4 text-left w-10">
                    <input 
                        type="checkbox" 
                        className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer" 
                        checked={selectedOrders.size > 0 && selectedOrders.size === filteredOrders.length}
                        onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-left">Order</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-center">Payment</th>
                  <th className="px-6 py-4 text-center">Fulfillment</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-sans">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className={`hover:bg-zinc-50/50 transition-colors group ${selectedOrders.has(order.id) ? "bg-zinc-50" : ""}`}>
                    <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                            className="rounded border-zinc-300 text-black focus:ring-black cursor-pointer" 
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                        />
                    </td>
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
                        <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                                order.status === 'PAID' ? 'bg-green-50 text-green-600' : 
                                order.status === 'DRAFT' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {order.status === 'PAID' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                {order.status}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase ${
                                order.fulfillment === 'FULFILLED' 
                                ? 'bg-black text-white' 
                                : 'bg-zinc-100 text-zinc-400'
                            }`}>
                                {order.fulfillment || 'Unfulfilled'}
                            </span>
                        </div>
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

      {/* Batch Action Bar */}
      {selectedOrders.size > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 z-50">
            <div className="flex items-center gap-2 border-r border-zinc-700 pr-6 mr-2">
                <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold">
                    {selectedOrders.size}
                </span>
                <span className="text-[13px] font-medium text-zinc-400 uppercase tracking-widest">Selected</span>
            </div>
            
            <div className="flex gap-4">
                <button 
                    disabled={isProcessingBatch}
                    onClick={() => handleBatchAction("fulfill")}
                    className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:text-green-400 transition-colors disabled:opacity-50"
                >
                    <PackageCheck size={16} /> Mark as Fulfilled
                </button>
                <button 
                    disabled={isProcessingBatch}
                    onClick={() => handleBatchAction("unfulfill")}
                    className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:text-yellow-400 transition-colors disabled:opacity-50"
                >
                   <Clock size={16} /> Revert to Unshipped
                </button>
                <button 
                    disabled={isProcessingBatch}
                    onClick={() => handleBatchAction("cancel")}
                    className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest hover:text-red-400 transition-colors disabled:opacity-50"
                >
                    <Ban size={16} /> Cancel Items
                </button>
            </div>

            <button 
                onClick={() => setSelectedOrders(new Set())}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors ml-4"
            >
                <X size={18} className="text-zinc-500" />
            </button>
          </div>
      )}
    </div>
  );
}
