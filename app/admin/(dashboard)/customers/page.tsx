"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  MapPin, 
  ShoppingBag,
  MoreHorizontal,
  Loader2,
  ChevronRight
} from "lucide-react";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [activeSegment, setActiveSegment] = useState("all");

  const filteredCustomers = customers
    .filter((c: any) => 
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeSegment === "all" || (activeSegment === "vip" ? c.totalSpent > 5000 : true))
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Manage and view your customer base and their lifetime value.</p>
        </div>
        <button className="bg-white border border-zinc-200 px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all">
          Import Customers
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-3 rounded-xl w-full md:w-96 border border-zinc-100">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full"
            />
          </div>
          <div className="flex gap-3">
            <button 
                onClick={() => setActiveSegment(activeSegment === "all" ? "vip" : "all")}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-[13px] transition-all font-medium ${
                    activeSegment === "vip" ? "bg-black text-white border-black" : "border-zinc-200 hover:bg-zinc-50"
                }`}
            >
              <Filter size={16} />
              Segment: {activeSegment === "vip" ? "VIP (> $5k)" : "All Customers"}
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-32 text-center">
            <Users className="mx-auto text-zinc-100 mb-4" size={64} strokeWidth={1} />
            <h3 className="text-lg font-medium text-zinc-900">No customers yet</h3>
            <p className="text-zinc-500 text-[13px]">Customers will appear here once they place an order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Location</th>
                  <th className="px-6 py-4 text-left">Orders</th>
                  <th className="px-6 py-4 text-left">Total Spent</th>
                  <th className="px-6 py-4 text-left">Last Active</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-sans">
                {filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-bold uppercase text-zinc-500 border border-zinc-200">
                          {customer.name.slice(0, 2)}
                        </div>
                        <span className="text-[13px] font-bold capitalize">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-500">{customer.email}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-400 flex items-center gap-1">
                        <MapPin size={14} />
                        {customer.location}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium">{customer.ordersCount} orders</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-black">${customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-400">
                      {new Date(customer.lastOrder).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-300 hover:text-black transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
