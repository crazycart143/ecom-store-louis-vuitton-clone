"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [formData, setFormData] = useState({
    storeName: "",
    supportEmail: "",
    currency: "",
    taxRate: 0,
    // Payment
    stripePublicKey: "",
    stripeSecretKey: "",
    // Security
    enableTwoFactor: false,
    sessionTimeout: "30",
    // Notifications
    notifyOrder: true,
    notifyStock: true,
    notifyReview: false
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setFormData({
            storeName: data.storeName || "",
            supportEmail: data.supportEmail || "",
            currency: data.currency || "USD",
            taxRate: data.taxRate || 0,
            stripePublicKey: data.stripePublicKey || "",
            stripeSecretKey: data.stripeSecretKey || "",
            enableTwoFactor: data.enableTwoFactor || false,
            sessionTimeout: data.sessionTimeout || "30",
            notifyOrder: data.notifyOrder ?? true,
            notifyStock: data.notifyStock ?? true,
            notifyReview: data.notifyReview ?? false
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
            ) : (
                <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
                    {/* GENERAL TAB */}
                    {activeTab === "general" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === "payments" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-bold border-b border-zinc-100 pb-4">Payment Gateways</h2>
                            <p className="text-[13px] text-zinc-500">Configure your Stripe integration for processing payments.</p>

                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Stripe Public Key</label>
                                <input 
                                    type="text" 
                                    value={formData.stripePublicKey}
                                    onChange={(e) => setFormData({...formData, stripePublicKey: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all font-mono text-[12px]"
                                    placeholder="pk_test_..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Stripe Secret Key</label>
                                <input 
                                    type="password" 
                                    value={formData.stripeSecretKey}
                                    onChange={(e) => setFormData({...formData, stripeSecretKey: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all font-mono text-[12px]"
                                    placeholder="sk_test_..."
                                />
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <h2 className="text-lg font-bold border-b border-zinc-100 pb-4">Security Settings</h2>

                             <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                <div>
                                    <h3 className="font-bold text-[14px]">Two-Factor Authentication</h3>
                                    <p className="text-[12px] text-zinc-500">Require an extra security code when logging in.</p>
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, enableTwoFactor: !formData.enableTwoFactor})}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.enableTwoFactor ? "bg-black" : "bg-zinc-200"}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.enableTwoFactor ? "translate-x-6" : "translate-x-0"}`} />
                                </div>
                             </div>

                             <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Admin Session Timeout</label>
                                <select 
                                    value={formData.sessionTimeout}
                                    onChange={(e) => setFormData({...formData, sessionTimeout: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all cursor-pointer"
                                >
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="60">1 Hour</option>
                                    <option value="1440">24 Hours</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <h2 className="text-lg font-bold border-b border-zinc-100 pb-4">Email Notifications</h2>
                             
                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div>
                                        <h3 className="font-bold text-[14px]">New Order Alerts</h3>
                                        <p className="text-[12px] text-zinc-500">Get notified when a customer places an order.</p>
                                    </div>
                                    <button
                                        type="button" 
                                        onClick={() => setFormData({...formData, notifyOrder: !formData.notifyOrder})}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.notifyOrder ? "bg-black border-black text-white" : "border-zinc-300 bg-white"}`}
                                    >
                                        {formData.notifyOrder && <Check size={12} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div>
                                        <h3 className="font-bold text-[14px]">Low Stock Warnings</h3>
                                        <p className="text-[12px] text-zinc-500">Get notified when product inventory is low.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, notifyStock: !formData.notifyStock})}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.notifyStock ? "bg-black border-black text-white" : "border-zinc-300 bg-white"}`}
                                    >
                                        {formData.notifyStock && <Check size={12} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div>
                                        <h3 className="font-bold text-[14px]">New Customer Reviews</h3>
                                        <p className="text-[12px] text-zinc-500">Get notified when a customer leaves a review.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, notifyReview: !formData.notifyReview})}
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.notifyReview ? "bg-black border-black text-white" : "border-zinc-300 bg-white"}`}
                                    >
                                        {formData.notifyReview && <Check size={12} />}
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-zinc-100">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-black text-white px-8 py-3 rounded-lg text-[13px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Save All Changes
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
