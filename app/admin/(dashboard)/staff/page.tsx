"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Trash2,
  Mail,
  Calendar,
  Key,
  X,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: "active" | "inactive";
  createdAt: string;
  lastActive: string | null;
}

export default function StaffManagement() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<{show: boolean, memberId: string, memberName: string}>({show: false, memberId: "", memberName: ""});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF"
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaff(data);
      }
    } catch (error) {
      toast.error("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Successfully added ${formData.name} as ${formData.role}`);
        setShowAddModal(false);
        setFormData({ name: "", email: "", password: "", role: "STAFF" });
        fetchStaff();
      } else {
        toast.error(data.error || "Failed to add staff member");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the staff?`)) return;
    
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Staff member removed");
        fetchStaff();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove staff member");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    const newStatus = member.status === "inactive" ? "active" : "inactive";
    try {
      const res = await fetch(`/api/admin/staff/${member._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Account ${newStatus === "active" ? "activated" : "deactivated"}`);
        fetchStaff();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }
    setIsSubmitting(true);
    try {
        const res = await fetch(`/api/admin/staff/${showPasswordModal.memberId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        });
        if (res.ok) {
            toast.success("Password updated successfully");
            setShowPasswordModal({ show: false, memberId: "", memberName: "" });
            setNewPassword("");
        } else {
            const data = await res.json();
            toast.error(data.error || "Failed to update password");
        }
    } catch (error) {
        toast.error("An error occurred");
    } finally {
        setIsSubmitting(false);
    }
  };

  const canManage = (memberRole: string) => {
    const myRole = session?.user?.role;
    if (myRole === "OWNER") return memberRole !== "OWNER";
    if (myRole === "ADMIN") return ["MANAGER", "STAFF"].includes(memberRole);
    return false;
  };

  const getRoleBadgeConfig = (role: string) => {
    switch (role) {
      case "OWNER": return {
        icon: ShieldAlert,
        colorClass: "bg-red-50 border-red-100 text-red-600",
        label: "Domain Owner"
      };
      case "ADMIN": return {
        icon: ShieldCheck,
        colorClass: "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-black/10",
        label: "Administrator"
      };
      case "MANAGER": return {
        icon: Shield,
        colorClass: "bg-white border-zinc-200 text-zinc-600 shadow-sm",
        label: "Operations Manager"
      };
      default: return {
        icon: UserCheck,
        colorClass: "bg-zinc-50 border-zinc-100 text-zinc-400",
        label: "Store Staff"
      };
    }
  };

  const timeAgo = (dateParam: string | Date | null) => {
    if (!dateParam) return { text: "Never", isOnline: false };
    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);

    if (seconds < 60) return { text: "Online", isOnline: true };
    if (minutes < 60) return { text: `${minutes}m ago`, isOnline: false };
    const hours = Math.round(minutes / 60);
    if (hours < 24) return { text: `${hours}h ago`, isOnline: false };
    const days = Math.round(hours / 24);
    if (days < 7) return { text: `${days}d ago`, isOnline: false };
    return { text: date.toLocaleDateString(), isOnline: false };
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOwner = session?.user?.role === "OWNER";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-black">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Staff & Permissions</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Manage team members and their administrative access levels.</p>
        </div>
        {(isOwner || session?.user?.role === "ADMIN") && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-6 py-3 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95"
          >
            <Plus size={18} />
            Add Staff Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden ring-1 ring-black/5">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl w-full md:w-96 border border-zinc-200 focus-within:border-black transition-all shadow-sm">
            <Search size={16} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] w-full font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-zinc-300" size={32} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50/50 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black border-y border-zinc-100">
                <tr>
                  <th className="px-8 py-5 text-left">Member</th>
                  <th className="px-8 py-5 text-left">Access Level</th>
                  <th className="px-8 py-5 text-left">Status</th>
                  <th className="px-8 py-5 text-left">Added On</th>
                  <th className="px-8 py-5 text-left">Last Active</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[12px] font-black uppercase">
                          {member.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-black">{member.name}</p>
                          <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
                            <Mail size={12} />
                            <p className="text-[11px] font-medium">{member.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = getRoleBadgeConfig(member.role);
                          const Icon = config.icon;
                          return (
                            <div className={`px-4 py-2 rounded-xl flex items-center gap-2.5 border transition-all duration-300 group/badge ${config.colorClass}`}>
                              <Icon size={14} strokeWidth={2.5} className="shrink-0" />
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{member.role}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <button 
                        disabled={!canManage(member.role)}
                        onClick={() => handleToggleStatus(member)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all
                          ${member.status === 'inactive' 
                            ? "bg-zinc-100 text-zinc-400 border-zinc-200" 
                            : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                          } ${!canManage(member.role) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                       >
                         {member.status || "active"}
                       </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar size={14} />
                        <span className="text-[13px] font-medium">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {(() => {
                        const { text, isOnline } = timeAgo(member.lastActive);
                        return (
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex h-2 w-2">
                                {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-green-500" : "bg-zinc-200"}`}></span>
                            </div>
                            <span className={`text-[12px] font-bold ${isOnline ? "text-green-600" : "text-zinc-400"}`}>{text}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-6">
                      {canManage(member.role) && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={() => setShowPasswordModal({ show: true, memberId: member._id, memberName: member.name })}
                             className="p-2.5 hover:bg-zinc-100 rounded-xl text-zinc-300 hover:text-black transition-all active:scale-95"
                             title="Change Password"
                          >
                             <Key size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(member._id, member.name)}
                            className="p-2.5 hover:bg-red-50 rounded-xl text-zinc-300 hover:text-red-500 transition-all active:scale-95"
                            title="Remove Member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && filteredStaff.length === 0 && (
          <div className="py-32 text-center text-zinc-400 space-y-4">
            <Users className="mx-auto text-zinc-100" size={64} strokeWidth={1} />
            <p className="text-[13px] font-medium uppercase tracking-widest">No team members found</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ring-1 ring-black/5">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Add Staff Member</h2>
                  <p className="text-zinc-500 text-[13px] mt-1">Assign roles and provision access.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Bernard Arnault"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Work Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="staff@louisvuitton.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-black transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Initial Password</label>
                    <div className="relative">
                      <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-black transition-all outline-none pr-12"
                      />
                      <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Access Level</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "STAFF", label: "Staff", icon: UserCheck },
                        { id: "MANAGER", label: "Manager", icon: Shield },
                        { id: "ADMIN", label: "Admin", icon: ShieldCheck },
                        ...(isOwner ? [{ id: "OWNER", label: "Owner", icon: ShieldAlert }] : [])
                      ].map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData({...formData, role: role.id})}
                          className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            formData.role === role.id 
                            ? "bg-black border-black text-white shadow-lg ring-4 ring-black/5" 
                            : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-300"
                          }`}
                        >
                          <role.icon size={16} className={formData.role === role.id ? "text-white" : "text-zinc-400"} />
                          <p className="text-[11px] font-black uppercase tracking-widest leading-none">{role.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                         Confirm Provisioning
                         <UserCheck size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showPasswordModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPasswordModal({show: false, memberId: "", memberName: ""})} />
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Change Password</h3>
              <p className="text-zinc-500 text-[12px] mb-6">Updating security credentials for <span className="text-black font-bold uppercase">{showPasswordModal.memberName}</span></p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">New Password</label>
                  <input 
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-black transition-all outline-none"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowPasswordModal({show: false, memberId: "", memberName: ""})}
                    className="flex-1 px-4 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleUpdatePassword}
                    className="flex-1 bg-black text-white px-4 py-4 rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
