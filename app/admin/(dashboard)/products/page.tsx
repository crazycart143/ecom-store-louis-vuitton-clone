"use client";

import { useEffect, useState, Suspense } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  ExternalLink,
  Loader2,
  Trash2,
  Edit,
  ChevronDown,
  X,
  Download,
  Lock
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "STAFF";

  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(products.map((p: any) => p.category?.name).filter(Boolean)))];

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
            setProducts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleExport = async () => {
    try {
        const res = await fetch("/api/admin/export/products");
        if (!res.ok) throw new Error("Export failed");
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maison_products_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Maison Catalog Exported");
    } catch (error) {
        toast.error("Failed to export catalog");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This will also remove all images and details.")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const filteredProducts = products.filter((p: any) => 
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.handle?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeCategory === "all" || p.category?.name === activeCategory)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Manage your catalog, stock and visibility.</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            type="file" 
            id="import-csv" 
            className="hidden" 
            accept=".csv"
            onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const loadingToast = toast.loading("Importing products...");

                try {
                    const text = await file.text();
                    // Simple CSV Parser
                    const lines = text.split(/\r?\n/);
                    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
                    
                    const products = [];
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                        const obj: any = {};
                        
                        headers.forEach((h, index) => {
                            let val = row[index] ? row[index].trim() : '';
                            val = val.replace(/^"|"$/g, '').replace(/""/g, '"');
                            
                            if (h === 'images' || h === 'details') {
                                obj[h] = val.split('|').map(s => s.trim()).filter(Boolean);
                            } else {
                                obj[h] = val;
                            }
                        });
                        if (obj.name) products.push(obj);
                    }

                    if (products.length === 0) throw new Error("No valid products found in CSV");

                    const res = await fetch("/api/admin/import/products", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ products })
                    });

                    const data = await res.json();
                    
                    if (res.ok) {
                        toast.success(`Imported ${data.imported} products successfully`);
                        if (data.errors?.length > 0) {
                            toast.warning(`Check console for ${data.errors.length} skipped items`);
                            console.warn("Import warnings:", data.errors);
                        }
                        fetchProducts();
                    } else {
                        throw new Error(data.error || "Import failed");
                    }
                } catch (error: any) {
                    console.error(error);
                    toast.error(error.message || "Failed to parse or import CSV");
                } finally {
                    toast.dismiss(loadingToast);
                    e.target.value = ''; // Reset input
                }
            }}
          />
          <button 
            onClick={() => document.getElementById('import-csv')?.click()}
            className="bg-white text-zinc-900 px-6 py-3 rounded-xl text-[13px] font-bold border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest active:scale-95"
          >
            <Download size={18} className="rotate-180" />
            Import CSV
          </button>
          
          <button 
            onClick={handleExport}
            className="bg-white text-zinc-900 px-6 py-3 rounded-xl text-[13px] font-bold border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest active:scale-95"
          >
            <Download size={18} />
            Export CSV
          </button>

          {isStaff ? (
            <div className="relative group">
              <button 
                disabled
                className="bg-zinc-100 text-zinc-400 px-6 py-3 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-not-allowed border border-zinc-200 uppercase tracking-widest"
              >
                <Lock size={16} />
                Add Product
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl ring-1 ring-white/10">
                Only Managers and higher can add products
              </div>
            </div>
          ) : (
            <Link 
              href="/admin/products/new"
              className="bg-black text-white px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10 uppercase tracking-widest active:scale-95"
            >
              <Plus size={18} />
              Add Product
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-3 rounded-xl w-full md:w-96 border border-zinc-100 shadow-inner">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white border border-zinc-200 px-5 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm w-full md:w-64 justify-between"
            >
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-zinc-400" />
                <span className="text-zinc-400">Category:</span>
                <span className="text-black">{activeCategory}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-full md:w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                  {categories.map((cat: any) => (
                    <button 
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between
                        ${activeCategory === cat ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
                    >
                      {cat}
                      {activeCategory === cat && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Handle</th>
                  <th className="px-6 py-4 text-left">Visibility</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-center">Wishlisted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-zinc-100 border border-zinc-100">
                           <Image 
                            src={product.images?.[0]?.url || "/images/placeholder.jpg"} 
                            alt={product.name}
                            fill
                            className="object-cover"
                           />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="text-[13px] font-bold truncate text-black">{product.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate tracking-tight">{product.images?.length || 0} images available</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-500 font-mono">{product.handle}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit font-bold tracking-widest uppercase ${product.scheduledAt && new Date(product.scheduledAt) > new Date() ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {product.scheduledAt && new Date(product.scheduledAt) > new Date() ? 'Scheduled' : 'Live'}
                        </span>
                        {product.requiredTags?.length > 0 && (
                            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter flex items-center gap-1">
                                <Lock size={10} /> {product.requiredTags.join(', ')}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-zinc-600">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-black font-sans">${product.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-500 text-center">
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-[11px] font-bold">
                             {product.wishlistCount || 0}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isStaff ? (
                          <>
                            <div className="relative group/action">
                                <button disabled className="p-2 text-zinc-200 cursor-not-allowed">
                                    <Edit size={16} />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-50">
                                    Edit Disabled
                                </div>
                            </div>
                            <div className="relative group/action">
                                <button disabled className="p-2 text-zinc-200 cursor-not-allowed">
                                    <Trash2 size={16} />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-50">
                                    Delete Disabled
                                </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative group/action">
                                <Link 
                                href={`/admin/products/edit/${product.id}`}
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors block"
                                >
                                <Edit size={16} />
                                </Link>
                                <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-50">
                                    Edit Product
                                </div>
                            </div>
                            <div className="relative group/action">
                                <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                <Trash2 size={16} />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-50">
                                    Delete Product
                                </div>
                            </div>
                          </>
                        )}
                        <div className="relative group/action">
                            <Link 
                            href={`/product/${product.handle}`} 
                            target="_blank"
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors block"
                            >
                            <ExternalLink size={16} />
                            </Link>
                            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/action:opacity-100 transition-opacity pointer-events-none z-50">
                                View Live Store
                            </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-6 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <p className="text-[12px] text-zinc-500 font-medium">Showing {filteredProducts.length} products</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-zinc-200 rounded-lg text-[12px] hover:bg-white transition-all disabled:opacity-50 font-medium" disabled>
              Previous
            </button>
            <button className="px-4 py-2 border border-zinc-200 rounded-lg text-[12px] hover:bg-white transition-all disabled:opacity-50 font-medium" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
