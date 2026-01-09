"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import { SidebarMenu } from "./SidebarMenu";
import { SearchOverlay } from "./SearchOverlay";
import { CallUsSidebar } from "./CallUsSidebar";

export function Header({ variant = "transparent" }: { variant?: "transparent" | "black" | "white" }) {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleCart, cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [announcementBarHeight, setAnnouncementBarHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for announcement bar and get its height
    const checkAnnouncementBar = () => {
      const announcementBar = document.getElementById("announcement-bar");
      if (announcementBar) {
        const height = announcementBar.offsetHeight;
        setAnnouncementBarHeight(height);
        return true;
      } else {
        setAnnouncementBarHeight(0);
        return false;
      }
    };

    // Check immediately
    checkAnnouncementBar();

    // Check multiple times with delays to ensure we catch it
    const timer1 = setTimeout(checkAnnouncementBar, 50);
    const timer2 = setTimeout(checkAnnouncementBar, 100);
    const timer3 = setTimeout(checkAnnouncementBar, 200);
    const timer4 = setTimeout(checkAnnouncementBar, 500);

    // Set up MutationObserver to watch for announcement bar being added
    const observer = new MutationObserver(() => {
      checkAnnouncementBar();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check on resize
    window.addEventListener("resize", checkAnnouncementBar);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      observer.disconnect();
      window.removeEventListener("resize", checkAnnouncementBar);
    };
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      style={{ top: `${announcementBarHeight}px` }}
      className={`fixed left-0 right-0 z-[80] transition-all duration-500 ${
        variant === "black" 
          ? "bg-black text-white py-3 md:py-4" 
          : variant === "white"
            ? (isScrolled ? "bg-white text-black shadow-sm py-3 md:py-4" : "bg-transparent text-black py-4 md:py-6")
            : isScrolled 
              ? "bg-white text-black shadow-sm py-3 md:py-4" 
              : "bg-transparent text-white py-4 md:py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={18} className="md:w-5 md:h-5" />
            <span className="hidden md:inline">Menu</span>
          </button>
          <button 
            className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={18} className="md:w-5 md:h-5" />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        {/* Center Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className={`text-lg md:text-2xl lg:text-3xl font-serif tracking-[0.15em] md:tracking-[0.2em] uppercase transition-all duration-500 whitespace-nowrap ${
            (isScrolled || variant !== "transparent") ? "scale-90" : "scale-100"
          }`}>
            Louis Vuitton
          </h1>
        </Link>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            className="hidden lg:flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsCallOpen(true)}
          >
            <span>Call Us</span>
          </button>
          <Link href="/wishlist" className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity relative">
            <Heart size={18} className={`md:w-5 md:h-5 ${wishlist.length > 0 ? "fill-current" : ""}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button id="cart-icon" className="flex items-center gap-2 hover:opacity-70 transition-opacity relative" onClick={toggleCart}>
            <ShoppingBag size={18} className="md:w-5 md:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
          <Link 
            href={session ? "/account" : "/login"} 
            className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <User size={18} className="md:w-5 md:h-5" />
            {session && <span className="hidden md:inline text-[10px] uppercase tracking-widest">{session.user?.name?.split(' ')[0]}</span>}
          </Link>
          {session?.user && session.user.role === "ADMIN" && (
            <Link 
              href="/admin" 
              className="bg-black text-white px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-all"
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CallUsSidebar isOpen={isCallOpen} onClose={() => setIsCallOpen(false)} />
    </header>
  );
}
