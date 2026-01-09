"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, AlertCircle, ChevronLeft, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
        toast.error("Access Denied", {
          description: "Please verify your security keys."
        });
        setLoading(false);
      } else {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black">
      {/* Premium Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.4] scale-[1.02]"
          style={{ backgroundImage: 'url("/images/lv_admin_login_bg.png")' }} // Assuming manually naming it or using the generated one
          // Note: In a real app, I'd move the generated image to public/images/
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Decorative Light Glows */}
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-zinc-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-zinc-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-white mx-auto rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/20 mb-8"
          >
            <span className="font-serif font-black text-3xl text-black tracking-tighter">LV</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-serif text-white tracking-[0.2em] uppercase mb-3">Maison Portal</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-zinc-700" />
              <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] py-1">Authorized Personnel Only</p>
              <div className="h-px w-8 bg-zinc-700" />
            </div>
          </motion.div>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-4xl p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold ml-1">Admin Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 transition-colors group-focus-within:text-white">
                    <Mail size={16} strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border border-zinc-800/80 text-white pl-11 pr-4 py-4 rounded-2xl focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all font-sans text-sm placeholder:text-zinc-700"
                    placeholder="E-post address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Secure Key</label>
                  <button type="button" className="text-[9px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Emergency Reset</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600 transition-colors group-focus-within:text-white">
                    <Lock size={16} strokeWidth={1.5} />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-black/40 border border-zinc-800/80 text-white pl-11 pr-4 py-4 rounded-2xl focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all font-sans text-sm placeholder:text-zinc-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 text-red-400 text-[12px] bg-red-400/5 p-4 rounded-xl border border-red-400/10"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white transition-transform duration-500 group-hover:scale-105" />
              <div className="relative bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 transition-colors group-hover:bg-zinc-100 shadow-2xl active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <ShieldCheck size={16} strokeWidth={2} />
                    <span>Authenticate</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
            <Link 
                href="/" 
                className="group inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all text-[11px] uppercase tracking-[0.3em] font-black"
            >
                <div className="p-2 rounded-full border border-zinc-800 transition-colors group-hover:border-white/20 group-hover:bg-white/5">
                  <ChevronLeft size={14} />
                </div>
                Return to Maison
            </Link>
        </motion.div>
      </motion.div>
      
      {/* Security Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 flex items-center gap-3 text-zinc-500"
      >
        <div className="h-px w-6 bg-zinc-800" />
        <ShieldCheck size={14} />
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Encrypted 256-Bit TLS</span>
        <div className="h-px w-6 bg-zinc-800" />
      </motion.div>
    </div>
  );
}
