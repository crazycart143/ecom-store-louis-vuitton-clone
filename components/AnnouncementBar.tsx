"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useSession } from "next-auth/react";

interface AnnouncementSettings {
  announcementEnabled: boolean;
  announcementType: "normal" | "marquee" | "countdown";
  announcementText: string;
  announcementDate: string;
  announcementBg: string;
  announcementColor: string;
  announcementLink: string;
}

export default function AnnouncementBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [impersonationBarHeight, setImpersonationBarHeight] = useState(0);

  useEffect(() => {
    // Don't fetch settings on admin pages
    if (pathname?.startsWith("/admin")) {
      return;
    }

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
      })
      .catch((err) => {
        console.error("AnnouncementBar - Fetch error:", err);
      });
  }, [pathname]);

  useEffect(() => {
    // Set up MutationObserver to watch for changes in the impersonation bar
    const checkBars = () => {
      const impBar = document.getElementById("impersonation-bar");
      setImpersonationBarHeight(impBar ? impBar.offsetHeight : 0);
    };

    checkBars();
    const observer = new MutationObserver(checkBars);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", checkBars);

    let interval: NodeJS.Timeout | undefined;
    if (settings?.announcementType === "countdown" && settings.announcementDate) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const target = new Date(settings.announcementDate).getTime();
        const distance = target - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkBars);
      if (interval) clearInterval(interval);
    };
  }, [settings, session]);

  // Don't show announcement bar on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (!settings?.announcementEnabled) return null;

  const content = (
    <div
      id="announcement-bar"
      style={{ backgroundColor: settings.announcementBg, color: settings.announcementColor }}
      className="w-full py-3 px-4 text-center text-[11px] md:text-[13px] font-bold uppercase tracking-[0.2em] overflow-hidden"
    >
      {settings.announcementType === "marquee" ? (
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="mx-8">{settings.announcementText}</span>
          <span className="mx-8">{settings.announcementText}</span>
          <span className="mx-8">{settings.announcementText}</span>
          <span className="mx-8">{settings.announcementText}</span>
          <span className="mx-8">{settings.announcementText}</span>
        </div>
      ) : settings.announcementType === "countdown" ? (
        <span className="inline-flex items-center justify-center gap-2 flex-wrap">
          <span>{settings.announcementText}</span>
          <span className="opacity-90 bg-white/20 px-3 py-1 rounded-md font-mono text-[12px]">
            {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </span>
      ) : (
        settings.announcementText
      )}
    </div>
  );

  return (
    <div 
      className="fixed left-0 right-0 z-[90]"
      style={{ top: `${impersonationBarHeight}px` }}
    >
      {settings.announcementLink ? (
        <Link href={settings.announcementLink} className="block hover:opacity-90 transition-opacity">
          {content}
        </Link>
      ) : content}
    </div>
  );
}
