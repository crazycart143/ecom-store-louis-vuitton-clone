import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Louis Vuitton | Official Website",
    template: "%s | Louis Vuitton"
  },
  description: "Experience the world of Louis Vuitton. Discover the latest collections of luxury fashion, leather goods, and high-end lifestyle accessories.",
  keywords: ["Louis Vuitton", "Luxury Fashion", "Designer Bags", "High-end Apparel"],
  authors: [{ name: "Louis Vuitton Clone" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://louis-vuitton-clone.vercel.app",
    siteName: "Louis Vuitton Clone",
    title: "Louis Vuitton | Official Website",
    description: "Experience the world of Louis Vuitton. Luxury fashion, leather goods, and high-end lifestyle.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Louis Vuitton",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Vuitton | Official Website",
    description: "Experience the world of Louis Vuitton. Luxury fashion, leather goods, and high-end lifestyle.",
    images: ["/images/og-image.jpg"],
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-white text-black`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
