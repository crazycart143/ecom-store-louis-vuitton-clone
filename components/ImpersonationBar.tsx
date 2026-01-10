"use client";

import { useSession } from "next-auth/react";
import { UserCircle, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ImpersonationBar = () => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  if (!session?.isImpersonating) return null;

  const handleStopImpersonating = async () => {
    try {
      toast.loading("Restoring admin session...");
      await updateSession({ targetUserId: "stop" });
      toast.dismiss();
      toast.success("Admin session restored");
      router.push("/admin/customers");
    } catch (error) {
      toast.error("Failed to restore admin session");
    }
  };

  return (
    <div id="impersonation-bar" className="bg-zinc-900 text-white py-3 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500 shadow-2xl h-[52px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <UserCircle size={20} className="text-zinc-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          </div>
          <p className="text-[13px] font-medium tracking-tight">
            Impersonating: <span className="font-bold text-yellow-400">{session.user?.name || session.user?.email}</span>
          </p>
        </div>
        <div className="h-4 w-px bg-zinc-700 hidden md:block" />
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold hidden md:block">
          Support Mode Active
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.push("/admin/customers")}
          className="hidden md:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          Return to Admin <ChevronRight size={14} />
        </button>
        <button
          onClick={handleStopImpersonating}
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
        >
          <LogOut size={14} /> Exit
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBar;
