"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Globe, 
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Save,
  Check
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    storeName: "",
    supportEmail: "",
    currency: "",
    taxRate: 0
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setFormData({
            storeName: data.storeName || "",
            supportEmail: data.supportEmail || "",
            currency: data.currency || "USD",
            taxRate: data.taxRate || 0
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const res = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            toast.success("Settings saved successfully");
        } else {
            toast.error("Failed to save settings");
        }
    } catch (err) {
        toast.error("An error occurred");
    } finally {
        setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-500 text-[13px] mt-1">Configure your e-commerce engine and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-medium transition-all text-left ${
                        activeTab === tab.id 
                        ? "bg-black text-white" 
                        : "bg-white text-zinc-500 hover:bg-zinc-50 hover:text-black"
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 min-h-[500px]">
            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-zinc-300" size={32} />
                </div>
            ) : activeTab === "general" ? (
                <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold border-b border-zinc-100 pb-4">Store Details</h2>
                        
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Store Name</label>
                            <input 
                                type="text" 
                                value={formData.storeName}
                                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                                className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Support Email</label>
                            <input 
                                type="email" 
                                value={formData.supportEmail}
                                onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                                className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Currency</label>
                                <select 
                                    value={formData.currency}
                                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all cursor-pointer"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                           <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Tax Rate</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                                        className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                                    />
                                    <span className="absolute right-4 top-3.5 text-zinc-400 font-bold">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-black text-white px-8 py-3 rounded-lg text-[13px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                        {(() => {
                            const Icon = tabs.find(t => t.id === activeTab)?.icon;
                            return Icon ? <Icon size={32} strokeWidth={1} /> : null;
                        })()}
                    </div>
                    <h3 className="text-lg font-bold capitalize">{activeTab} Configuration</h3>
                    <p className="text-zinc-400 text-[13px] max-w-sm">
                        This module is currently being upgraded. Please check back later for {activeTab} settings.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
