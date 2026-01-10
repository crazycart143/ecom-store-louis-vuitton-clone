"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Loader2,
  Check
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    price: "",
    description: "",
    categoryId: "",
  });

  const [images, setImages] = useState<string[]>([""]);
  const [details, setDetails] = useState<string[]>([""]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: images.filter(img => img.trim() !== ""),
          details: details.filter(d => d.trim() !== ""),
        }),
      });

      if (res.ok) {
        toast.success("Product created successfully");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create product");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.length ? newImages : [""]);
  };

  const addDetailField = () => setDetails([...details, ""]);
  const removeDetailField = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails.length ? newDetails : [""]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-black">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-zinc-500 text-[13px]">Draft your new signature item for the collection.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <h2 className="text-[14px] uppercase tracking-widest font-bold border-b border-zinc-50 pb-4">General Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                  placeholder="e.g. Monogram Keepall 55"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold">Handle (URL Slug)</label>
                <input 
                  type="text" 
                  value={formData.handle}
                  onChange={(e) => setFormData({...formData, handle: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                  placeholder="e.g. monogram-keepall-55"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all min-h-[150px]"
                  placeholder="Describe the artisan craftsmanship and luxury details..."
                  required
                />
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <h2 className="text-[14px] uppercase tracking-widest font-bold border-b border-zinc-50 pb-4">Product Media</h2>
            
            <div className="space-y-6 font-sans">
              <div className="mb-4">
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const newUrls = res.map(file => file.url);
                    // Filter out the initial empty string and add new URLs
                    setImages(prev => {
                      const filtered = prev.filter(url => url.trim() !== "");
                      return [...filtered, ...newUrls];
                    });
                    toast.success("Upload Complete");
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`ERROR! ${error.message}`);
                  }}
                  className="ut-button:bg-black ut-label:text-black ut-button:ut-readying:bg-zinc-800"
                />
              </div>

              <div className="space-y-4">
                {images.map((url, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => {
                        const newImages = [...images];
                        newImages[index] = e.target.value;
                        setImages(newImages);
                      }}
                      className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[13px] focus:outline-none focus:border-black transition-all"
                      placeholder="Paste image URL here..."
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={addImageField}
                className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-[12px] uppercase tracking-widest font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Another Image
              </button>
            </div>
          </div>
          </section>

          {/* Product Specifications */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <h2 className="text-[14px] uppercase tracking-widest font-bold border-b border-zinc-50 pb-4">Product Details & Specs</h2>
            
            <div className="space-y-4 font-sans">
              {details.map((content, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={content}
                      onChange={(e) => {
                        const newDetails = [...details];
                        newDetails[index] = e.target.value;
                        setDetails(newDetails);
                      }}
                      className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[13px] focus:outline-none focus:border-black transition-all"
                      placeholder="e.g. 100% Calf Leather"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeDetailField(index)}
                    className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={addDetailField}
                className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-[12px] uppercase tracking-widest font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Specification
              </button>
            </div>
          </section>

        </div>

        {/* Right Column: Sidebar Options */}
        <div className="space-y-8">
          
          {/* Pricing */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6 font-sans">
            <h2 className="text-[14px] uppercase tracking-widest font-bold border-b border-zinc-50 pb-4">Organization & Price</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold font-serif">Luxury Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-zinc-400">$</span>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-100 pl-8 pr-4 py-3 rounded-xl text-[16px] font-bold focus:outline-none focus:border-black transition-all"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold font-serif">Collection Category</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Collection...</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Status & Actions */}
          <section className="bg-zinc-900 p-8 rounded-2xl shadow-xl space-y-6 text-white font-serif">
            <div>
              <h3 className="text-lg font-bold mb-2">Publishing</h3>
              <p className="text-zinc-400 text-[12px] font-sans leading-relaxed tracking-tight font-light">
                This product will be immediately visible on the storefront collections once published.
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 rounded-xl text-[12px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Publish to Store</>}
              </button>
              <button 
                type="button"
                onClick={() => router.back()}
                className="w-full bg-zinc-800 text-zinc-400 py-4 rounded-xl text-[12px] uppercase tracking-widest font-bold hover:text-white transition-all font-sans"
              >
                Discard Draft
              </button>
            </div>
          </section>

        </div>

      </form>
    </div>
  );
}
