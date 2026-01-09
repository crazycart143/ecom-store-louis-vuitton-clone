"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { SidebarMenu } from "./SidebarMenu";
import { SearchOverlay } from "./SearchOverlay";
import { CallUsSidebar } from "./CallUsSidebar";

export function Header({ variant = "transparent" }: { variant?: "transparent" | "black" | "white" }) {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleCart, cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[80] transition-all duration-500 ${
        variant === "black" 
          ? "bg-black text-white py-4" 
          : variant === "white"
            ? (isScrolled ? "bg-white text-black shadow-sm py-4" : "bg-transparent text-black py-6")
            : isScrolled 
              ? "bg-white text-black shadow-sm py-4" 
              : "bg-transparent text-white py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
            <span className="hidden md:inline">Menu</span>
          </button>
          <button 
            className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} />
            <span className="hidden md:inline">Search</span>
          </button>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className={`text-2xl md:text-3xl font-serif tracking-[0.2em] uppercase transition-all duration-500 ${
            (isScrolled || variant !== "transparent") ? "scale-90" : "scale-100"
          }`}>
            Louis Vuitton
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          <button 
            className="hidden md:flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-70 transition-opacity"
            onClick={() => setIsCallOpen(true)}
          >
            <span>Call Us</span>
          </button>
          <Link href="/wishlist" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Heart size={20} />
          </Link>
          <button className="flex items-center gap-2 hover:opacity-70 transition-opacity relative" onClick={toggleCart}>
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
          <Link 
            href={session ? "/account" : "/login"} 
            className="hidden md:flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <User size={20} />
            {session && <span className="text-[10px] uppercase tracking-widest">{session.user?.name?.split(' ')[0]}</span>}
          </Link>
          {session?.user && session.user.role === "ADMIN" && (
            <Link 
              href="/admin" 
              className="bg-black text-white px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-zinc-800 transition-all ml-2"
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
