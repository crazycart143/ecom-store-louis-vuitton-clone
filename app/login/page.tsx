"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Check if user is admin - don't allow admin login here
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      
      if (session?.user?.role === "ADMIN") {
        // Force signout
        await fetch("/api/auth/signout", { method: "POST" });
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header variant="white" />
      <div className="pt-32 pb-24 flex items-center justify-center">
        <div className="w-full max-w-md px-8">
          <h1 className="text-3xl font-serif text-center mb-8 uppercase tracking-widest">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 text-[13px] text-center rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-zinc-200 py-3 text-[13px] focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-zinc-200 py-3 text-[13px] focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-full text-[11px] font-luxury tracking-[0.2em] uppercase hover:bg-zinc-800 transition-colors disabled:bg-zinc-400"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-[13px] text-zinc-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-black underline underline-offset-4">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
