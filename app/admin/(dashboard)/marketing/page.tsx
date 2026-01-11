"use client";

import { useEffect, useState } from "react";
import { 
  Tag, 
  Plus, 
  Search, 
  Clock, 
  Trash2, 
  Loader2, 
  Calendar, 
  DollarSign, 
  Percent,
  AlertCircle,
  X,
  CreditCard,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Discount {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'inactive';
  expiryDate: string | null;
  minPurchase: number;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export default function MarketingManagement() {
  const { data: session } = useSession();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    expiryDate: "",
    usageLimit: ""
  });

  const fetchDiscounts = async () => {
    try {
      const res = await fetch("/api/admin/marketing");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDiscounts(data);
      }
    } catch (error) {
      toast.error("Failed to load promotion data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Promotion Established");
        setShowAddModal(false);
        setFormData({
          code: "",
          type: "percentage",
          value: "",
          minPurchase: "",
          expiryDate: "",
          usageLimit: ""
        });
        fetchDiscounts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Establishment failed");
      }
    } catch (error) {
      toast.error("A system error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
        const res = await fetch(`/api/admin/marketing/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Promotion deleted");
            fetchDiscounts();
        } else {
            toast.error("Failed to delete promotion");
        }
    } catch (error) {
        toast.error("Error deleting promotion");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
        const res = await fetch(`/api/admin/marketing/${id}`, { 
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            toast.success(`Promotion ${newStatus}`);
            fetchDiscounts();
        } else {
            toast.error("Failed to update status");
        }
    } catch (error) {
        toast.error("Error updating status");
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Marketing Management</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Design and oversee exclusive promotional events and incentives.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus size={18} />
          Create Discount
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl ring-1 ring-black/5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-black mb-6 border border-zinc-100">
            <Tag size={20} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Total Promotions</h3>
          <p className="text-3xl font-bold">{discounts.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl ring-1 ring-black/5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6 border border-green-100">
            <UserCheck size={20} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Active Now</h3>
          <p className="text-3xl font-bold">{discounts.filter(d => d.status === 'active').length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl ring-1 ring-black/5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 border border-amber-100">
            <Clock size={20} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Expiring Soon</h3>
          <p className="text-3xl font-bold">{discounts.filter(d => d.expiryDate).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl w-full md:w-96 border border-zinc-200 focus-within:border-black transition-all shadow-sm">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search promotion codes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50/50 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black border-y border-zinc-100">
                <tr>
                  <th className="px-8 py-5 text-left">Internal Code</th>
                  <th className="px-8 py-5 text-left">Benefit Type</th>
                  <th className="px-8 py-5 text-left">Performance</th>
                  <th className="px-8 py-5 text-left">Status & Validity</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-[12px] font-black uppercase tracking-widest ring-4 ring-black/5">
                          {discount.code.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-black tracking-widest uppercase">{discount.code}</p>
                          <p className="text-[11px] font-medium text-zinc-400 mt-0.5 uppercase tracking-tighter">Established {new Date(discount.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        {discount.type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                        <span className="text-[13px] font-bold text-black">
                          {discount.type === 'percentage' ? `${discount.value}% OFF` : `₱${discount.value} OFF`}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-[12px] font-bold text-black">{discount.usedCount}</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Redemptions</span>
                        </div>
                        <div className="w-32 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-black transition-all duration-1000" 
                            style={{ width: `${Math.min((discount.usedCount / (discount.usageLimit || 100)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${discount.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-300'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${discount.status === 'active' ? 'text-green-600' : 'text-zinc-400'}`}>
                            {discount.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                          <Clock size={12} />
                          <span className="font-medium tracking-tight">
                            {discount.expiryDate ? `Expires ${new Date(discount.expiryDate).toLocaleDateString()}` : "Perpetual Access"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleToggleStatus(discount._id, discount.status)}
                            className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-black transition-all active:scale-95"
                            title={discount.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <AlertCircle size={16} />
                        </button>
                        <button 
                            onClick={() => handleDelete(discount._id)}
                            className="p-2.5 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-500 transition-all active:scale-95"
                            title="Delete Promotion"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Promotion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ring-1 ring-black/5">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 border-none px-0">Establish Promotion</h2>
                  <p className="text-zinc-500 text-[13px] mt-1">Define the parameters of the new incentive.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 hover:bg-zinc-50 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleAddDiscount} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Promotional Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g., PROMO2026"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-bold uppercase tracking-widest focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Reward Type</label>
                    <div className="flex items-center gap-2 p-1.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, type: 'percentage'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === 'percentage' ? "bg-black text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-100"}`}
                       >
                         <Percent size={14} /> %
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData({...formData, type: 'fixed'})}
                         className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${formData.type === 'fixed' ? "bg-black text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-100"}`}
                       >
                         <DollarSign size={14} /> Fixed
                       </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Value</label>
                    <input 
                      type="number" 
                      placeholder={formData.type === 'percentage' ? "20" : "5000"}
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-2 border-t border-zinc-100">
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5 text-black">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Min. Entry Value</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-black transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 text-black">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Expiry Date</label>
                      <input 
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-bold focus:bg-white focus:border-black transition-all outline-none appearance-none"
                      />
                    </div>
                   </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                         Finalize Campaign
                         <Tag size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
