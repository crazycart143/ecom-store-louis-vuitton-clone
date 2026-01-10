"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  DollarSign,
  Package,
  TrendingUp,
  MessageSquare,
  Truck
} from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_order": return ShoppingBag;
    case "high_value_order": return DollarSign;
    case "new_customer": return User;
    case "payment_failed": return AlertCircle;
    case "shipping_update": return Truck;
    case "low_stock": return Package;
    case "abandoned_cart": return ShoppingBag;
    case "support_inquiry": return MessageSquare;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "new_order": return "blue";
    case "high_value_order": return "emerald";
    case "new_customer": return "purple";
    case "payment_failed": return "red";
    case "shipping_update": return "blue";
    case "low_stock": return "amber";
    case "abandoned_cart": return "zinc";
    case "support_inquiry": return "blue";
    default: return "zinc";
  }
};

function timeAgo(dateParam: string | Date) {
  if (!dateParam) return "Unknown";
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const today = new Date();
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 90) return '1m ago';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const filteredNotifications = allNotifications
    .filter((n) => {
      if (activeTab === "unread") return !n.read;
      if (activeTab === "archived") return n.read;
      return true;
    })
    .filter((n) => {
      if (!searchQuery) return true;
      return (
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
          <p className="text-zinc-500 text-[13px] mt-1">View and manage your alerts and activity log.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={handleMarkAllRead}
              className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2"
            >
                <Check size={16} />
                Mark all read
            </button>
            <button 
              onClick={handleClearAll}
              className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-50 transition-all flex items-center gap-2"
            >
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
                    All ({allNotifications.length})
                </button>
                <button 
                    onClick={() => setActiveTab("unread")}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === "unread" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                >
                    Unread ({allNotifications.filter(n => !n.read).length})
                </button>
                <button 
                    onClick={() => setActiveTab("archived")}
                    className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === "archived" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-black"}`}
                >
                    Archived ({allNotifications.filter(n => n.read).length})
                </button>
            </div>
            
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="Search activity..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] w-full md:w-64 focus:outline-none focus:border-black transition-all"
                />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
                <div className="divide-y divide-zinc-50">
                    {filteredNotifications.map((notif) => {
                      const NotifIcon = getNotificationIcon(notif.type);
                      const color = getNotificationColor(notif.type);
                      
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                          className={`p-6 flex gap-4 hover:bg-zinc-50 transition-colors group cursor-pointer ${!notif.read ? "bg-blue-50/30" : ""}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 border 
                                ${color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                                  color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                  color === "purple" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                  color === "red" ? "bg-red-50 text-red-600 border-red-100" :
                                  color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  "bg-zinc-50 text-zinc-600 border-zinc-100"}`}
                            >
                                <NotifIcon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-[14px] font-medium truncate ${!notif.read ? "text-black font-bold" : "text-zinc-700"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {timeAgo(notif.createdAt)}
                                    </span>
                                </div>
                                <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                                {notif.priority === "high" && (
                                  <span className="inline-block mt-2 text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-full font-bold uppercase">
                                    High Priority
                                  </span>
                                )}
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                        </div>
                      );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                        <Bell size={32} strokeWidth={1} />
                    </div>
                    <h3 className="text-zinc-900 font-bold text-lg">No notifications found</h3>
                    <p className="text-zinc-500 text-[13px] mt-1 max-w-sm">
                        {activeTab === "unread" ? "You're all caught up! No new alerts to review." : searchQuery ? "No notifications match your search." : "Adjust your filters to see more activity logs."}
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
