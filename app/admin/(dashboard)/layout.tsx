"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Globe
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Media", href: "/admin/media", icon: ImageIcon },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

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
      <aside className={`w-72 bg-zinc-900 text-white flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
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
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-[12px] uppercase tracking-widest transition-all ${
                  isActive 
                  ? "bg-white text-black font-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]" 
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.name}
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
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-4 px-5 text-zinc-500 hover:text-red-400 text-[12px] uppercase tracking-widest font-bold transition-colors w-full text-left"
          >
            <ChevronLeft size={20} className="rotate-180" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-zinc-50 border border-zinc-100 px-5 py-2.5 rounded-xl w-80 focus-within:bg-white focus-within:border-black transition-all">
              <Search size={18} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search command..." 
                className="bg-transparent border-none focus:outline-none text-[13px] w-full placeholder:text-zinc-400 font-medium"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <button className="text-zinc-400 hover:text-black transition-bounce relative p-2">
              <Bell size={22} strokeWidth={1.5} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
            </button>
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
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
