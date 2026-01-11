"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { VideoSection } from "@/components/VideoSection";
import { CollectionSection } from "@/components/CollectionSection";
import { LatestWomenSection } from "@/components/LatestWomenSection";
import { MonogramMidnightSection } from "@/components/MonogramMidnightSection";
import { PageLoader } from "@/components/PageLoader";

import { Reveal } from "@/components/Reveal";
import { useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Fail-safe: If the video takes too long, hide the loader anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // 6 seconds max loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <PageLoader isLoading={isLoading} />
      <Header />
      <Hero 
        onReady={() => setIsLoading(false)} 
        onError={() => setIsLoading(false)}
      />
      
      <Reveal>
        <CategoryGrid />
      </Reveal>

      <Reveal>
        <VideoSection />
      </Reveal>

      <Reveal>
        <CollectionSection />
      </Reveal>
      
      {/* Campaign Section - The Latest */}
      <Reveal>
        <section className="relative w-full aspect-video md:aspect-21/9 overflow-hidden group cursor-pointer">
          <div 
            className="w-full h-full bg-cover bg-top transition-transform duration-2000 group-hover:scale-105"
            style={{ backgroundImage: 'url("/images/Women_Alma_The_Latest_HP_Push_Jan25_DI3.jpg")' }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
        </section>
      </Reveal>

      <Reveal>
        <LatestWomenSection />
      </Reveal>

      {/* Campaign Section - Monogram Midnight */}
      <Reveal>
        <section className="relative w-full aspect-video md:aspect-21/9 overflow-hidden group cursor-pointer">
          <div 
            className="w-full h-full bg-cover bg-top transition-transform duration-2000 group-hover:scale-105"
            style={{ backgroundImage: 'url("/images/Monogram_Midnight_HP_Push_Jan25_DI3.webp")' }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-40" />
        </section>
      </Reveal>

      <Reveal>
        <MonogramMidnightSection />
      </Reveal>

      {/* Louis Vuitton Services Section */}
      <section className="py-32 px-6 md:px-12 bg-white">
        <div className="container mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-serif mb-6 tracking-tight">Louis Vuitton Services</h2>
            <p className="text-sm text-zinc-500 max-w-2xl mx-auto mb-20 leading-relaxed font-light">
              Louis Vuitton offers an array of tailored services – including Client Advisor support, signature gift wrapping, and exclusive personalization options.
            </p>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Client Advisor Services", 
                image: "/images/LV_ContactUs_WW_HP_Services_Push_20240425_DII.webp",
                links: [{ label: "Contact Us", href: "#" }]
              },
              { 
                title: "Art of Gifting", 
                image: "/images/LV_Gifting_WW_HP_Services_Push_20240425_DII.webp",
                links: [{ label: "Gifts for Women", href: "#" }, { label: "Gifts for Men", href: "#" }]
              },
              { 
                title: "Personalization", 
                image: "/images/LV_Personalization_WW_HP_Services_Push_1104_DII.webp",
                links: [{ label: "Explore", href: "#" }]
              }
            ].map((service, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="space-y-8 flex flex-col items-center group">
                  <div className="aspect-3/4 w-full bg-zinc-50 overflow-hidden relative">
                     <div 
                       className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                       style={{ backgroundImage: `url(${service.image})` }}
                     />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-base font-serif tracking-tight">{service.title}</h3>
                    <div className="flex flex-wrap justify-center gap-6">
                      {service.links.map((link) => (
                        <Link 
                          key={link.label} 
                          href={link.href} 
                          className="text-[11px] uppercase tracking-widest font-medium border-b border-black pb-0.5 hover:opacity-60 transition-opacity"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
