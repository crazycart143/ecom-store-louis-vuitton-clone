"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  X, 
  Plus, 
  Loader2,
  Check,
  Save,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    // Fetch data
    const fetchData = async () => {
        try {
            const [catsRes, productRes] = await Promise.all([
                fetch("/api/categories"),
                fetch(`/api/products/${id}`)
            ]);

            const cats = await catsRes.json();
            const product = await productRes.json();

            if (!productRes.ok) {
                throw new Error(product.error || "Failed to fetch product");
            }

            setCategories(cats);
            setFormData({
                name: product.name,
                handle: product.handle,
                price: product.price?.toString() || "", 
                description: product.description || "",
                categoryId: product.categoryId || "",
            });
            setImages(product.images ? product.images.map((img: any) => img.url) : [""]);
            setDetails(product.details ? product.details.map((d: any) => d.content) : [""]);
            
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to load product data");
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: images.filter(img => img.trim() !== ""),
          details: details.filter(d => d.trim() !== ""),
        }),
      });

      if (res.ok) {
        toast.success("Product updated successfully");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update product");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="animate-spin text-zinc-300" size={32} />
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-black">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Product</h1>
            <p className="text-zinc-500 text-[13px]">Refine and update product attributes.</p>
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
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-400 mb-2 font-bold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all min-h-[150px]"
                  required
                />
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <h2 className="text-[14px] uppercase tracking-widest font-bold border-b border-zinc-50 pb-4">Product Media</h2>
            
            <div className="space-y-8 font-sans">
              <div>
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const newUrls = res.map(file => file.url);
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((url, index) => {
                const isVideo = url.match(/\.(mp4|webm|mov)$/i);
                return (
                  <div key={index} className="relative group aspect-square bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
                    {url ? (
                      isVideo ? (
                        <video src={url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <span className="text-[10px] uppercase font-bold">Empty</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                        <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => {
                                const newImages = [...images];
                                newImages[index] = e.target.value;
                                setImages(newImages);
                            }}
                            className="w-full bg-white/90 text-black text-[10px] px-2 py-1 rounded focus:outline-none"
                            placeholder="Media URL..."
                        />
                        <button 
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                );
              })}
              
              <button 
                type="button"
                onClick={addImageField}
                className="aspect-square border-2 border-dashed border-zinc-100 rounded-xl text-zinc-400 text-[12px] uppercase tracking-widest font-bold hover:border-black hover:text-black transition-all flex flex-col items-center justify-center gap-2"
              >
                <Plus size={24} />
                <span>Add Media</span>
              </button>
            </div>
          </div>
          </section>

          {/* Product Specifications */}
          <section className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-50 pb-4">
                <h2 className="text-[14px] uppercase tracking-widest font-bold">Specifications</h2>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Label : Value</span>
            </div>
            
            <div className="space-y-3 font-sans">
              {details.map((content, index) => {
                const [label, ...rest] = content.split(":");
                const value = rest.join(":"); // Re-join in case value has colons
                
                return (
                    <div key={index} className="flex gap-3 items-center group">
                    <div className="flex-1 grid grid-cols-2 gap-3 bg-zinc-50 rounded-xl p-2 border border-zinc-100 focus-within:border-black transition-colors">
                        <input 
                            type="text" 
                            value={label}
                            onChange={(e) => {
                                const newDetails = [...details];
                                newDetails[index] = `${e.target.value}:${value || ''}`;
                                setDetails(newDetails);
                            }}
                            className="bg-transparent text-right font-bold text-[13px] border-r border-zinc-200 px-2 focus:outline-none placeholder:text-zinc-300"
                            placeholder="Label (e.g. Material)"
                        />
                        <input 
                            type="text" 
                            value={value || ''}
                            onChange={(e) => {
                                const newDetails = [...details];
                                newDetails[index] = `${label}:${e.target.value}`;
                                setDetails(newDetails);
                            }}
                            className="bg-transparent text-[13px] px-2 focus:outline-none placeholder:text-zinc-300"
                            placeholder="Value (e.g. Leather)"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={() => removeDetailField(index)}
                        className="p-3 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    </div>
                );
              })}
              <button 
                type="button"
                onClick={() => setDetails([...details, ":"])}
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

          {/* Save & Actions */}
          <section className="bg-zinc-900 p-8 rounded-2xl shadow-xl space-y-6 text-white font-serif">
            <div>
              <h3 className="text-lg font-bold mb-2">Update Status</h3>
              <p className="text-zinc-400 text-[12px] font-sans leading-relaxed tracking-tight font-light">
                Changes will be reflected across all storefront fragments immediately after saving.
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-white text-black py-4 rounded-xl text-[12px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </section>

        </div>

      </form>
    </div>
  );
}
