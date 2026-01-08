"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  const footerSections = [
    {
      title: "Help",
      links: [
        { label: "You can call or email us.", href: "#" },
        { label: "FAQ's", href: "#" },
        { label: "Product Care", href: "#" },
        { label: "Stores", href: "#" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Repairs", href: "#" },
        { label: "Personalization", href: "#" },
        { label: "Art of Gifting", href: "#" },
        { label: "Download our Apps", href: "#" },
      ],
    },
    {
      title: "About Louis Vuitton",
      links: [
        { label: "Fashion Shows", href: "#" },
        { label: "Arts & Culture", href: "#" },
        { label: "La Maison", href: "#" },
        { label: "Sustainability", href: "#" },
        { label: "Latest News", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      title: "Email Sign-Up",
      content: (
        <div className="space-y-4">
          <p className="text-[11px] leading-relaxed text-zinc-600">
            Sign up for Louis Vuitton emails and receive the latest news from the Maison, including exclusive online pre-launches and new collections.
          </p>
          <Link href="#" className="text-[11px] uppercase tracking-widest font-medium border-b border-black pb-0.5 inline-block">
            Follow Us
          </Link>
        </div>
      ),
    },
  ];

  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-12 px-6 md:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-black">
                {section.title}
              </h4>
              {section.links ? (
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className={`text-[11px] transition-opacity hover:opacity-60 ${
                          link.label.includes("call") ? "underline underline-offset-4" : ""
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                section.content
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-[11px]">
             <span className="font-medium">Louis Vuitton</span>
             <span className="text-zinc-400">·</span>
             <span className="text-zinc-500">MyLV</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
             <h1 className="text-2xl font-serif tracking-[0.3em] uppercase text-black">
               Louis Vuitton
             </h1>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-zinc-400">
             © Louis Vuitton 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
