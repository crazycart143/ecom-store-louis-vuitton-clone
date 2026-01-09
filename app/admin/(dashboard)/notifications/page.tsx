"use client";

import { useState } from "react";
import { 
  Bell, 
  Check, 
  Clock, 
  Filter, 
  MoreHorizontal, 
  Search, 
  ShoppingBag, 
  Trash2, 
  User, 
  AlertCircle
} from "lucide-react";

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data - Empty to show placeholder as requested
  const allNotifications: any[] = [];

  const notifications = activeTab === "unread" ? [] : allNotifications;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
          <p className="text-zinc-500 text-[13px] mt-1">View and manage your alerts and activity log.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2">
                <Check size={16} />
                Mark all read
            </button>
            <button className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2">
                <Trash2 size={16} />
                Clear all
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4 bg-zinc-50/50">
            <div className="flex bg-zinc-100 p-1 rounded-lg self-start">
                <button 
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === "all" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setActiveTab("unread")}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === "unread" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                >
                    Unread
                </button>
                <button 
                    onClick={() => setActiveTab("archived")}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === "archived" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                >
                    Archived
                </button>
            </div>
            
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="Search activity..." 
                    className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] w-full md:w-64 focus:outline-none focus:border-black transition-all"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1">
            {notifications.length > 0 ? (
                <div className="divide-y divide-zinc-50">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-6 flex gap-4 hover:bg-zinc-50 transition-colors group cursor-pointer ${!notif.read ? "bg-blue-50/30" : ""}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 border 
                                ${notif.color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                                  notif.color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                  "bg-amber-50 text-amber-600 border-amber-100"}`}
                            >
                                <notif.icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-[14px] font-medium truncate ${!notif.read ? "text-black font-bold" : "text-zinc-700"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {notif.time}
                                    </span>
                                </div>
                                <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-black transition-all">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                        <Bell size={32} strokeWidth={1} />
                    </div>
                    <h3 className="text-zinc-900 font-bold text-lg">No notifications found</h3>
                    <p className="text-zinc-500 text-[13px] mt-1 max-w-sm">
                        {activeTab === "unread" ? "You're all caught up! No new alerts to review." : "Adjust your filters to see more activity logs."}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
