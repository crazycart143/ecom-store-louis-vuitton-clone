"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Settings, 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Bell, 
  Megaphone,
  Globe, 
  HelpCircle,
  Link as LinkIcon,
  Loader2,
  Save,
  Check
} from "lucide-react";
import { toast } from "sonner";

function SettingsContent() {
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
    notifyReview: false,
    // Announcement Bar
    announcementEnabled: false,
    announcementType: "normal", // normal, marquee, countdown
    announcementText: "Welcome to our store!",
    announcementDate: "", // for countdown
    announcementBg: "#000000",
    announcementColor: "#FFFFFF",
    announcementLink: ""
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
            notifyReview: data.notifyReview ?? false,
            announcementEnabled: data.announcementEnabled || false,
            announcementType: data.announcementType || "normal",
            announcementText: data.announcementText || "Welcome to our store!",
            announcementDate: data.announcementDate || "",
            announcementBg: data.announcementBg || "#000000",
            announcementColor: data.announcementColor || "#FFFFFF",
            announcementLink: data.announcementLink || ""
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
    { id: "announcement", label: "Announcement", icon: Megaphone },
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

                    {/* ANNOUNCEMENT TAB */}
                    {activeTab === "announcement" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                <h2 className="text-lg font-bold">Announcement Bar</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-zinc-500">{formData.announcementEnabled ? "Enabled" : "Disabled"}</span>
                                    <div 
                                        onClick={() => setFormData({...formData, announcementEnabled: !formData.announcementEnabled})}
                                        className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${formData.announcementEnabled ? "bg-green-500" : "bg-zinc-200"}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${formData.announcementEnabled ? "translate-x-5" : "translate-x-0"}`} />
                                    </div>
                                </div>
                             </div>

                             {/* Preview */}
                             {formData.announcementEnabled && (
                                 <div className="rounded-xl border border-zinc-100 overflow-hidden">
                                    <div className="bg-zinc-100 px-4 py-2 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200">
                                        Live Preview
                                    </div>
                                    <div 
                                        style={{ backgroundColor: formData.announcementBg, color: formData.announcementColor }}
                                        className="p-3 text-center text-[12px] font-bold uppercase tracking-widest"
                                    >
                                        {formData.announcementType === "marquee" ? (
                                            <div className="animate-marquee whitespace-nowrap overflow-hidden">
                                                <span className="mx-4">{formData.announcementText}</span>
                                                <span className="mx-4">{formData.announcementText}</span>
                                                <span className="mx-4">{formData.announcementText}</span>
                                            </div>
                                        ) : formData.announcementType === "countdown" ? (
                                            <span>
                                                {formData.announcementText} <span className="opacity-75 bg-white/20 px-2 py-0.5 rounded ml-2">02 : 14 : 35</span>
                                            </span>
                                        ) : (
                                            formData.announcementText
                                        )}
                                    </div>
                                 </div>
                             )}

                             <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Display Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["normal", "marquee", "countdown"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({...formData, announcementType: type})}
                                            className={`px-4 py-3 rounded-xl border text-[12px] font-bold uppercase tracking-wider transition-all ${
                                                formData.announcementType === type 
                                                ? "bg-black text-white border-black" 
                                                : "bg-white text-zinc-500 border-zinc-200 hover:border-black hover:text-black"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Banner Text</label>
                                <input 
                                    type="text" 
                                    value={formData.announcementText}
                                    onChange={(e) => setFormData({...formData, announcementText: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                                    placeholder="e.g. Free Shipping on all orders over $1,500"
                                />
                             </div>

                             {formData.announcementType === "countdown" && (
                                 <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Target Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        value={formData.announcementDate}
                                        onChange={(e) => setFormData({...formData, announcementDate: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                                    />
                                 </div>
                             )}

                             <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Background Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={formData.announcementBg}
                                            onChange={(e) => setFormData({...formData, announcementBg: e.target.value})}
                                            className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5 bg-white"
                                        />
                                        <input 
                                            type="text" 
                                            value={formData.announcementBg}
                                            onChange={(e) => setFormData({...formData, announcementBg: e.target.value})}
                                            className="flex-1 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-xl text-[13px] font-mono focus:outline-none focus:border-black"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Text Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={formData.announcementColor}
                                            onChange={(e) => setFormData({...formData, announcementColor: e.target.value})}
                                            className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5 bg-white"
                                        />
                                        <input 
                                            type="text" 
                                            value={formData.announcementColor}
                                            onChange={(e) => setFormData({...formData, announcementColor: e.target.value})}
                                            className="flex-1 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-xl text-[13px] font-mono focus:outline-none focus:border-black"
                                        />
                                    </div>
                                </div>
                             </div>

                             <div>
                                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Link URL (Optional)</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-4 top-3.5 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        value={formData.announcementLink}
                                        onChange={(e) => setFormData({...formData, announcementLink: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 pl-11 pr-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                                        placeholder="https://..."
                                    />
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

export default function AdminSettings() {
  return (
    <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
        </div>
    }>
        <SettingsContent />
    </Suspense>
  );
}
