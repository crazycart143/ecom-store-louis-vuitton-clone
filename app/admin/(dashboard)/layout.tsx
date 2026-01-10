"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  ChevronLeft,
  Search,
  Bell,
  UserCircle,
  Menu,
  X,
  Image as ImageIcon,
  Globe,
  Layers,
  ShoppingBag as OrderIcon,
  DollarSign,
  User as UserIcon,
  AlertCircle,
  Truck as StatusTruck,
  Package as StockIcon,
  MessageSquare,
  History
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { AdminOnboarding } from "@/components/AdminOnboarding";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [unfulfilledCount, setUnfulfilledCount] = useState(0);
  const { clearCart } = useCart();
  const { clearWishlist } = useWishlist();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=5");
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Unfulfilled orders count
        const orderRes = await fetch("/api/orders");
        const orderData = await orderRes.json();
        if (Array.isArray(orderData)) {
          const unfulfilled = orderData.filter((order: any) => order.fulfillment === "UNFULFILLED").length;
          setUnfulfilledCount(unfulfilled);
        }

        // Notifications
        await fetchNotifications();
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_order": return OrderIcon;
      case "high_value_order": return DollarSign;
      case "new_customer": return UserIcon;
      case "payment_failed": return AlertCircle;
      case "shipping_update": return StatusTruck;
      case "low_stock": return StockIcon;
      case "abandoned_cart": return OrderIcon;
      case "support_inquiry": return MessageSquare;
      default: return Bell;
    }
  };

  const getNotificationLink = (notif: any) => {
    switch (notif.type) {
      case "new_order":
      case "high_value_order":
      case "payment_failed":
      case "shipping_update":
        return `/admin/orders/${notif.metadata?.orderId}`;
      case "new_customer":
        return `/admin/customers`;
      case "low_stock":
        return `/admin/products/${notif.metadata?.productId}`;
      default:
        return "/admin/notifications";
    }
  };

  const timeAgo = (dateParam: string | Date) => {
    if (!dateParam) return "Unknown";
    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notif: any) => {
    setIsNotificationsOpen(false);
    
    if (!notif.read) {
        try {
            await fetch("/api/admin/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: notif.id }),
            });
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }
    
    const link = getNotificationLink(notif);
    router.push(link);
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

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: unfulfilledCount },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: Layers },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Media", href: "/admin/media", icon: ImageIcon },
    { name: "Logs", href: "/admin/logs", icon: History },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const routes: {[key: string]: string} = {
    'dashboard': '/admin',
    'overview': '/admin',
    'products': '/admin/products',
    'inventory': '/admin/products',
    'orders': '/admin/orders',
    'sales': '/admin/orders',
    'customers': '/admin/customers',
    'users': '/admin/customers',
    'settings': '/admin/settings',
    'configuration': '/admin/settings',
    'payments': '/admin/settings?tab=payments',
    'security': '/admin/settings?tab=security',
    'notifications': '/admin/settings?tab=notifications',
    'media': '/admin/media',
    'images': '/admin/media',
    'collections': '/admin/collections',
    'categories': '/admin/collections'
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const query = (e.currentTarget.value).toLowerCase().trim();
        if (!query) return;
        
        if (routes[query]) {
            router.push(routes[query]);
        } else if (query === 'logout') {
            clearCart();
            clearWishlist();
            signOut({ callbackUrl: "/admin/login" });
        } else {
            router.push(`/admin/products?q=${encodeURIComponent(query)}`);
        }
        setSuggestions([]);
        setSearchQuery("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 1) {
        const matches = Object.keys(routes).filter(key => key.includes(query.toLowerCase()));
        setSuggestions(matches);
    } else {
        setSuggestions([]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-zinc-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform print:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-8 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black text-xs shadow-lg">LV</div>
            <span className="font-serif tracking-[0.2em] text-[13px] uppercase font-bold">Admin Panel</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const tourId = item.name.toLowerCase();
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                data-tour={tourId}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[12px] uppercase tracking-widest transition-all relative ${
                  isActive 
                  ? "bg-white text-black font-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]" 
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.name}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
          <Link 
            href="/"
            className="flex items-center gap-4 px-5 text-zinc-500 hover:text-white text-[12px] uppercase tracking-widest font-bold transition-colors"
          >
            <Globe size={20} />
            View Store
          </Link>
          <button 
            onClick={() => {
              clearCart();
              clearWishlist();
              signOut({ callbackUrl: "/admin/login" });
            }}
            className="flex items-center gap-4 px-5 text-zinc-500 hover:text-red-400 text-[12px] uppercase tracking-widest font-bold transition-colors w-full text-left"
          >
            <ChevronLeft size={20} className="rotate-180" />
            Log Out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-w-0 print:ml-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block relative w-96 z-50" data-tour="search">
                <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-100 px-5 py-2.5 rounded-xl w-full focus-within:bg-white focus-within:border-black transition-all">
                <Search size={18} className="text-zinc-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search command (e.g. 'payments')..." 
                    onKeyDown={handleSearch}
                    className="bg-transparent border-none focus:outline-none text-[13px] w-full placeholder:text-zinc-400 font-medium"
                />
                </div>
                {/* Search Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => {
                                    router.push(routes[suggestion]);
                                    setSuggestions([]);
                                    setSearchQuery("");
                                }}
                                className="w-full text-left px-5 py-3 text-[13px] hover:bg-zinc-50 transition-colors flex items-center justify-between group"
                            >
                                <span className="capitalize font-medium">{suggestion}</span>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest group-hover:text-black">Jump to</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8 relative">
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-zinc-400 hover:text-black transition-all relative p-2 outline-none group"
            >
              <Bell size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-[360px] bg-white rounded-2xl border border-zinc-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden ring-1 ring-black/5">
                    <div className="p-5 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                        <h3 className="font-bold text-[14px]">Activity Log</h3>
                        {notifications.some(n => !n.read) && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-[10px] bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-zinc-500 hover:text-black hover:border-black transition-all font-bold uppercase tracking-widest"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length > 0 ? (
                          <div className="divide-y divide-zinc-50">
                            {notifications.map((notif) => {
                                const Icon = getNotificationIcon(notif.type);
                                return (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 flex gap-4 hover:bg-zinc-50 cursor-pointer transition-colors relative group ${!notif.read ? 'bg-blue-50/20' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border
                                            ${notif.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className={`text-[13px] truncate ${!notif.read ? 'font-bold text-black' : 'font-medium text-zinc-600'}`}>{notif.title}</p>
                                                <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-2">{timeAgo(notif.createdAt)}</span>
                                            </div>
                                            <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                        </div>
                                        {!notif.read && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                );
                            })}
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                  <Bell size={24} className="text-zinc-300" strokeWidth={1.5} />
                              </div>
                              <h4 className="font-bold text-[13px] text-zinc-900 mb-1">No new notifications</h4>
                              <p className="text-[11px] text-zinc-500">You're all caught up!</p>
                          </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-zinc-50 bg-zinc-50/30">
                        <Link 
                            href="/admin/notifications"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="block text-center text-[11px] font-bold text-black hover:underline transition-colors py-1 uppercase tracking-widest"
                        >
                            View All Activity
                        </Link>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 pl-6 border-l border-zinc-100">
              <div className="hidden sm:block text-right">
                <p className="text-[12px] font-black text-black uppercase tracking-tight">E-Commerce Manager</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Online</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                  <UserCircle size={24} className="text-zinc-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto print:p-0 print:max-w-none" data-tour="dashboard">
          {children}
        </div>
      </main>

      {/* Onboarding Tour */}
      <AdminOnboarding onRestartAction={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
