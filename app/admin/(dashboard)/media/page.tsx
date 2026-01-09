"use client";

import { useEffect, useState } from "react";
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink,
  Plus,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminMedia() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  const fetchImages = async () => {
    // In our simplified schema, we get images from the Image collection
    const res = await fetch("/api/products");
    const products = await res.json();
    const allImages = products.flatMap((p: any) => p.images.map((img: any) => ({
        ...img,
        productName: p.name
    })));
    
    // De-duplicate by URL
    const uniqueImages = Array.from(new Set(allImages.map((a: any) => a.url)))
        .map(url => allImages.find((a: any) => a.url === url));

    setImages(uniqueImages);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const filteredImages = images.filter((img: any) => 
    img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Media Library</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Manage global product assets and brand imagery.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
        >
          <Upload size={18} />
          Add Media
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl w-full md:w-96">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full"
            />
          </div>
        </div>

        {/* Assets Grid */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-24 text-center">
              <ImageIcon className="mx-auto text-zinc-100 mb-4" size={64} strokeWidth={1} />
              <h3 className="text-lg font-medium text-zinc-400 font-serif lowercase italic">No luxury assets found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredImages.map((img: any, i) => (
                <div key={i} className="group relative aspect-square bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 hover:shadow-xl transition-all">
                  <Image 
                    src={img.url} 
                    alt="Asset"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        onClick={() => handleCopy(img.url)}
                        className="p-3 bg-white rounded-full text-black hover:bg-zinc-100 transition-colors shadow-lg"
                        title="Copy URL"
                    >
                      <Copy size={16} />
                    </button>
                    <Link 
                        href={img.url} 
                        target="_blank"
                        className="p-3 bg-white rounded-full text-black hover:bg-zinc-100 transition-colors shadow-lg"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-zinc-100 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] uppercase tracking-widest text-black truncate font-bold">
                        {img.productName || "Library Item"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal (Mock) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start font-serif">
              <div>
                <h2 className="text-2xl font-bold">Import Luxury Asset</h2>
                <p className="text-zinc-400 text-[13px] mt-1">Provide a high-resolution image URL to add to your global library.</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] uppercase tracking-widest text-zinc-400 font-bold">Image URL</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1 bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-[14px] focus:outline-none focus:border-black transition-all"
                  placeholder="https://images.remote.com/photo.jpg"
                />
              </div>
            </div>

            <button 
              onClick={() => {
                if (newUrl) {
                  toast.success("Asset imported successfully (Portfolio Mode)");
                  setIsUploadModalOpen(false);
                  setNewUrl("");
                }
              }}
              className="w-full bg-black text-white py-5 rounded-2xl text-[13px] uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-all font-serif"
            >
              Confirm Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fixed import for X
import { X } from "lucide-react";
