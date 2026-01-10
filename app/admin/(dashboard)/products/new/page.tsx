"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Loader2,
  Check,
  ImageIcon,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    price: "",
    description: "",
    categoryId: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [details, setDetails] = useState<string[]>([""]);
  const [isDragging, setIsDragging] = useState(false);

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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image`);
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => setLoading(true);
        reader.onloadend = () => {
            setImages(prev => [...prev, reader.result as string]);
            setLoading(false);
            toast.success(`Processed ${file.name}`);
        };
        reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
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

          {/* Media Manager */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-end border-b border-zinc-50 pb-4">
                <h2 className="text-[14px] uppercase tracking-widest font-bold">Media Manager</h2>
                <span className="text-[11px] text-zinc-400 font-medium">{images.length} file(s) uploaded</span>
            </div>
            
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer
                    ${isDragging ? "border-black bg-zinc-50 scale-[0.99]" : "border-zinc-100 hover:border-zinc-300"}
                    ${images.length > 0 ? "p-8 opacity-60 hover:opacity-100" : "p-12"}
                `}
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:text-black transition-all duration-500">
                    <Upload size={28} />
                </div>
                <div className="text-center">
                    <p className="text-[14px] font-bold text-zinc-900">
                        {images.length > 0 ? "Drop to add more" : "Drag & Drop or Click to upload"}
                    </p>
                    <p className="text-[12px] text-zinc-400 mt-1">PNG, JPG or WebP up to 10MB</p>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-100 group bg-zinc-50">
                        <img src={url} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                className="p-3 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform shadow-xl"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-white font-bold tracking-widest uppercase">
                            {index === 0 ? "Main" : `M-${index}`}
                        </div>
                    </div>
                ))}
                {images.length > 0 && (
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-black hover:text-black transition-all group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add More</span>
                    </button>
                )}
              </div>

              {/* Hidden File Input for Manual Trigger */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleManualUpload} 
                className="hidden" 
                multiple 
                accept="image/*"
              />

              {/* Legacy URL Section (Collapsible/Secondary) */}
              <div className="pt-4">
                <details className="group cursor-pointer">
                    <summary className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold hover:text-black list-none flex items-center gap-2">
                        <Plus size={10} className="group-open:rotate-45 transition-transform" />
                        Advanced: Add by URL
                    </summary>
                    <div className="mt-4 space-y-4">
                        {images.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <input 
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        const next = [...images];
                                        next[index] = e.target.value;
                                        setImages(next);
                                    }}
                                    className="flex-1 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-xl text-[12px] focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        ))}
                    </div>
                </details>
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
