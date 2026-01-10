"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  User, 
  Eye, 
  History,
  Filter,
  ArrowDownAz,
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  type: string;
  action: string;
  adminId: string;
  adminName: string;
  targetId: string;
  targetName: string;
  timestamp: string;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/logs");
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleExport = () => {
    if (logs.length === 0) return toast.error("No logs to export");
    
    const headers = ["Timestamp", "Administrator", "Action", "Target", "Type"];
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss"),
      `"${log.adminName}"`,
      `"${log.action}"`,
      `"${log.targetName}"`,
      log.type
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lv_security_audit_${format(new Date(), "yyyy_MM_dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Security logs exported to CSV");
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
        log.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeType === "all" || log.type === activeType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      {/* Unified Admin Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Security Audit Logs</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Comprehensive trail of administrative actions & system impersonations.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white border border-zinc-200 px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-3 active:scale-95"
        >
          <ExternalLink size={16} /> Export Logs
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Actions", value: logs.length, icon: History, color: "blue" },
          { label: "Impersonations", value: logs.filter(l => l.type === 'IMPERSONATION').length, icon: Eye, color: "yellow" },
          { label: "Security Status", value: "Active", icon: ShieldCheck, color: "green", customValue: "ACTIVE PROTECTION" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-xl ring-1 ring-black/5 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                <stat.icon size={24} />
            </div>
            <div>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <p className={`font-bold ${stat.customValue ? 'text-[14px] uppercase tracking-wider' : 'text-2xl text-black'}`}>
                    {stat.customValue || stat.value}
                </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl overflow-hidden min-h-[500px] ring-1 ring-black/5">
        {/* Filters Bar - Unified with Customers style */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row justify-between gap-4 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl w-full md:w-96 border border-zinc-200 focus-within:border-black transition-all shadow-sm">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by admin, target or action..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium"
            />
          </div>
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            {[
              { id: "all", label: "All" },
              { id: "IMPERSONATION", label: "Sessions" },
              { id: "ORDER", label: "Orders" },
              { id: "ROLE_CHANGE", label: "Staff" }
            ].map((type) => (
              <button 
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeType === type.id ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:text-black'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table - Unified styling */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-32 text-center">
              <ShieldCheck className="mx-auto text-zinc-100 mb-4" size={64} strokeWidth={1} />
              <h3 className="text-lg font-medium text-zinc-900">No logs found</h3>
              <p className="text-zinc-500 text-[13px]">No administrative activity matches your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black border-b border-zinc-100">
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Administrator</th>
                  <th className="px-8 py-5 text-center">Action</th>
                  <th className="px-8 py-5">Target Activity</th>
                  <th className="px-8 py-5 text-right w-40">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-black group-hover:underline">
                          {format(new Date(log.timestamp), "MMM dd, yyyy")}
                        </span>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                            <Clock size={12} className="text-zinc-300" /> {format(new Date(log.timestamp), "HH:mm:ss")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-[11px] font-black uppercase text-zinc-500 border border-zinc-200">
                          {log.adminName?.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-black">{log.adminName}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">ID: {log.adminId.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all
                        ${log.action.includes('STARTED') || log.action.includes('CREATED') || log.action.includes('FINALIZED')
                          ? 'bg-zinc-900 text-white border-zinc-900' 
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <User size={14} className="text-zinc-300" />
                        <div>
                          <p className="text-[13px] font-bold text-black">{log.targetName}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">Account Reference: {log.targetId.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end">
                        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3.5 py-1.5 rounded-lg border border-green-100">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Secure
                        </span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredLogs.length > 0 && (
            <div className="px-8 py-5 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
                    Forensic Trail: {filteredLogs.length} Records Loaded
                </p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm">Previous</button>
                    <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm">Next Page</button>
                </div>
            </div>
        )}
      </div>

      {/* Security Tip - Unified with Customers style */}
      <div className="bg-zinc-900 text-white p-8 rounded-3xl flex items-start gap-6 shadow-2xl shadow-black/20">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/10 shrink-0">
            <ShieldAlert size={28} />
        </div>
        <div>
            <h4 className="font-bold text-[14px] text-white mb-2 leading-none uppercase tracking-[0.2em]">Forensic Protocol active</h4>
            <p className="text-[12px] text-white/60 leading-relaxed max-w-3xl font-medium">
                The Security Audit system provides an immutable chronological record of all administrative interactions. Every data point including timestamps, actor IDs, and target metadata is cryptographically indexed to ensure complete transparency and compliance within the administrative oversight layer.
            </p>
        </div>
      </div>
    </div>
  );
}
