"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError("Invalid administrative credentials");
        toast.error("Access Denied");
        setLoading(false);
      } else {
        // Successful login - redirect to dashboard
        toast.success("Welcome back, Administrator");
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black z-0" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-20" />
      <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-20" />

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Brand Header */}
        <div className="text-center mb-10 space-y-4">
            <div className="w-16 h-16 bg-white mx-auto rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10 mb-6">
                <span className="font-serif font-black text-2xl text-black tracking-tighter">LV</span>
            </div>
            <h1 className="text-3xl font-serif text-white tracking-widest uppercase">Admin Portal</h1>
            <p className="text-zinc-500 text-[13px] font-medium tracking-wide">Restricted Access • Staff Only</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Admin Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-sans"
                  placeholder="admin@louisvuitton.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Secure Key</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-zinc-950/50 border border-zinc-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[13px] bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[12px] hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>
                <ShieldCheck size={16} className="text-zinc-400 group-hover:text-black transition-colors" />
                Authenticate
              </>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[12px] uppercase tracking-widest font-bold"
            >
                <ChevronLeft size={16} />
                Return to Storefront
            </Link>
        </div>
      </div>
      
      {/* Security Badge */}
      <div className="absolute bottom-6 flex items-center gap-2 text-zinc-700 opacity-50">
        <ShieldCheck size={14} />
        <span className="text-[10px] uppercase tracking-widest font-bold">256-Bit SSL Encrypted Connection</span>
      </div>
    </div>
  );
}
