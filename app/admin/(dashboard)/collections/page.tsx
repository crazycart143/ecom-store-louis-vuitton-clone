"use client";

import { useEffect, useState } from "react";
import { 
  Layers, 
  Search, 
  Plus, 
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [saving, setSaving] = useState(false);
  
  const { data: session } = useSession();
  const isStaff = session?.user?.role === "STAFF";

  const fetchCollections = () => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCollections(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName }),
      });

      if (res.ok) {
        toast.success("Collection created successfully");
        setNewCollectionName("");
        setIsCreating(false);
        fetchCollections();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create collection");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Collections</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Organize your products into catalog categories.</p>
        </div>
        {isStaff ? (
          <div className="relative group">
            <button 
              disabled
              className="bg-zinc-100 text-zinc-400 px-6 py-3 rounded-lg text-[13px] font-medium flex items-center gap-2 cursor-not-allowed border border-zinc-200"
            >
              <Lock size={16} />
              Create Collection
            </button>
            <div className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl ring-1 ring-white/10">
              Only Managers and higher can manage collections
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-black text-white px-6 py-3 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Create Collection
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm animate-in slide-in-from-top-2">
            <h3 className="font-bold mb-4 text-[14px] uppercase tracking-wider">New Collection</h3>
            <form onSubmit={handleCreate} className="flex gap-4">
                <input 
                    type="text" 
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Collection Name (e.g. Summer 2026)"
                    className="flex-1 bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:border-black transition-all"
                    autoFocus
                />
                <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-black text-white px-6 rounded-xl text-[13px] font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : "Save"}
                </button>
                <button 
                    type="button" 
                    onClick={() => setIsCreating(false)}
                    className="px-6 rounded-xl text-[13px] font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                >
                    Cancel
                </button>
            </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-4 bg-zinc-50 px-4 py-3 rounded-xl w-full md:w-96 border border-zinc-100">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search collections..." 
              className="bg-transparent border-none focus:outline-none text-[13px] w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-left">Collection Name</th>
                  <th className="px-6 py-4 text-left">Slug</th>
                  <th className="px-6 py-4 text-left">Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {collections.length > 0 ? (
                    collections.map((collection: any) => (
                    <tr key={collection.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                                    <Layers size={20} />
                                </div>
                                <span className="font-bold text-[13px]">{collection.name}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-zinc-500 font-mono">{collection.slug}</td>
                        <td className="px-6 py-4 text-[13px] text-zinc-500">{collection.productsCount || 0} Products</td>
                        <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isStaff ? (
                              <div className="relative group/del">
                                <button disabled className="p-2 text-zinc-200 cursor-not-allowed">
                                    <Trash2 size={16} />
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 w-32 px-2 py-1 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-md opacity-0 group-hover/del:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                  Permission Required
                                </div>
                              </div>
                            ) : (
                              <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                            )}
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 text-[13px]">
                            No collections found. Create one to get started.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
