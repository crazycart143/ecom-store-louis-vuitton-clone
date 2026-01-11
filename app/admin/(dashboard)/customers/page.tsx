"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, 
  Search, 
  Mail, 
  MapPin, 
  Loader2,
  ChevronRight,
  Eye,
  ShieldAlert
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AdminCustomers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState(searchParams.get("segment") || "all");

  const fetchCustomers = () => {
    setLoading(true);
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleImpersonate = async (customerId: string, customerName: string) => {
    try {
        toast.loading(`Switching to ${customerName}...`);
        await updateSession({ targetUserId: customerId });
        toast.dismiss();
        toast.success(`You are now viewing as ${customerName}`);
        router.push("/");
    } catch (error) {
        toast.error("Failed to impersonate user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
        const res = await fetch("/api/admin/customers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, role: newRole }),
        });
        if (res.ok) {
            toast.success("Role updated successfully");
            // Fetch updated data to show the new role and log the change
            fetch("/api/admin/customers")
              .then(r => r.json())
              .then(setCustomers);
        } else {
            const data = await res.json();
            toast.error(data.error || "Failed to update role");
        }
    } catch (error) {
        toast.error("An error occurred while updating role");
    }
  };

  const timeAgo = (dateParam: string | Date) => {
    if (!dateParam) return { text: "Never", isOnline: false };
    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);

    if (seconds < 60) return { text: "Online", isOnline: true };
    if (minutes < 60) return { text: `${minutes}m ago`, isOnline: false };
    const hours = Math.round(minutes / 60);
    if (hours < 24) return { text: `${hours}h ago`, isOnline: false };
    const days = Math.round(hours / 24);
    if (days < 7) return { text: `${days}d ago`, isOnline: false };
    return { text: date.toLocaleDateString(), isOnline: false };
  };

  const filteredCustomers = customers
    .filter((c: any) => 
      (!c.role || c.role === "USER") &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (
        activeSegment === "all" || 
        (activeSegment === "vip" ? c.totalSpent > 1000 : true) &&
        (activeSegment === "active" ? c.ordersCount > 2 : true) &&
        (activeSegment === "new" ? c.ordersCount === 1 : true)
      )
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Manage users, permissions, and impersonate for support.</p>
        </div>
        <button className="bg-white border border-zinc-200 px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm">
          Export List
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl overflow-hidden min-h-[500px] ring-1 ring-black/5">
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl w-full md:w-96 border border-zinc-200 focus-within:border-black transition-all shadow-sm">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium"
            />
          </div>
          <div className="flex gap-2 bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/50">
            {[
              { id: "all", label: "All Users" },
              { id: "vip", label: "High Value" },
              { id: "active", label: "Frequent" },
              { id: "new", label: "New Joiners" }
            ].map((segment) => (
              <button 
                key={segment.id}
                onClick={() => setActiveSegment(segment.id)}
                className={`px-5 py-2 rounded-lg text-[11px] font-black transition-all uppercase tracking-widest ${
                    activeSegment === segment.id ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-black"
                }`}
              >
                {segment.label}
              </button>
            ))}
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
            <h3 className="text-lg font-medium text-zinc-900">No users found</h3>
            <p className="text-zinc-500 text-[13px]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black border-b border-zinc-100">
                  <th className="px-8 py-5">User Identity</th>
                  <th className="px-8 py-5">Permissions</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5 text-center">LTV</th>
                  <th className="px-8 py-5">Activity</th>
                  <th className="px-8 py-5 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-[12px] font-black uppercase text-zinc-500 border border-zinc-200">
                          {customer.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-[14px] font-bold block">{customer.name}</span>
                          <span className="text-[11px] text-zinc-400 font-medium">{customer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {session?.user.role === "ADMIN" ? (
                        <select 
                          value={customer.role || "USER"}
                          onChange={(e) => handleRoleChange(customer.id, e.target.value)}
                          className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer transition-all
                            ${customer.role === "ADMIN" ? "bg-red-50 text-red-600 border-red-100" : 
                              customer.role === "MANAGER" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              customer.role === "STAFF" ? "bg-zinc-900 text-white border-zinc-900" :
                              "bg-zinc-100 text-zinc-600 border-zinc-200"}`}
                        >
                          <option value="USER">Customer</option>
                          <option value="STAFF">Staff</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border
                            ${customer.role === "ADMIN" ? "bg-red-50 text-red-600 border-red-100" : 
                              customer.role === "MANAGER" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              customer.role === "STAFF" ? "bg-zinc-900 text-white border-zinc-900" :
                              "bg-zinc-100 text-zinc-600 border-zinc-200"}`}
                        >
                          {customer.role || "USER"}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-[13px] text-zinc-500">
                        <div className="flex items-center gap-1.5 font-medium">
                            <MapPin size={14} className="text-zinc-300" />
                            {customer.location}
                        </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-center">
                        <p className="text-[14px] font-black text-black">${customer.totalSpent.toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{customer.ordersCount} Orders</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {(() => {
                        const { text, isOnline } = timeAgo(customer.lastActive);
                        return (
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex h-2 w-2">
                                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-green-500" : "bg-zinc-200"}`}></span>
                            </div>
                            <span className={`text-[12px] font-bold ${isOnline ? "text-green-600" : "text-zinc-400"}`}>{text}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2 justify-end">
                        <button 
                            onClick={() => handleImpersonate(customer.id, customer.name)}
                            className="group/btn relative px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all flex items-center gap-2 overflow-hidden shadow-lg shadow-black/5"
                        >
                            <span className="relative z-10">Support View</span>
                            <Eye size={12} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-transparent opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                        </button>
                        <button 
                            onClick={() => router.push(`/admin/customers/${customer.id}`)}
                            className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-300 hover:text-black transition-all ring-1 ring-zinc-200/50"
                            title="View Customer Details"
                        >
                            <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Security Tip */}
      <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl flex items-start gap-5">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm shadow-yellow-200/50">
            <ShieldAlert size={24} />
        </div>
        <div>
            <h4 className="font-bold text-[14px] text-yellow-900 mb-1 leading-none uppercase tracking-widest">Enhanced Support Security</h4>
            <p className="text-[12px] text-yellow-700/80 leading-relaxed max-w-2xl">
                Only authenticated administrators can reassign roles or access critical system settings. All impersonation sessions and permission changes are recorded in the <span className="font-bold underline cursor-pointer" onClick={() => router.push('/admin/logs')}>Security Audit Logs</span> for system compliance.
            </p>
        </div>
      </div>
    </div>
  );
}
