"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";

import { OverviewChart } from "@/components/admin/OverviewChart";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    salesTrend: "0%",
    totalOrders: 0,
    ordersTrend: "0%",
    totalCustomers: 0,
    customersTrend: "0%",
    avgOrderValue: 0,
    aovTrend: "0%"
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const [graphData, setGraphData] = useState<any[]>([]);

  const [topCollections, setTopCollections] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    Promise.all([
        fetch("/api/orders").then(res => res.json()),
        fetch("/api/products").then(res => res.json())
    ]).then(([orders, products]) => {
        if (!Array.isArray(orders) || !Array.isArray(products)) return;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Filter orders by period
        const currentOrders = orders.filter((o: any) => new Date(o.createdAt) >= thirtyDaysAgo);
        const previousOrders = orders.filter((o: any) => {
            const date = new Date(o.createdAt);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        // Calculate Totals
        const totalSales = orders.reduce((acc: number, order: any) => acc + order.total, 0);
        const currentSales = currentOrders.reduce((acc: number, order: any) => acc + order.total, 0);
        const previousSales = previousOrders.reduce((acc: number, order: any) => acc + order.total, 0);

        const calculateTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? "+100%" : "0%";
            const change = ((curr - prev) / prev) * 100;
            return (change >= 0 ? "+" : "") + Math.round(change) + "%";
        };

        // Monthly Graph Data
        const monthlyData = [
            { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
            { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
            { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
            { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
        ];

        orders.forEach((order: any) => {
            const date = new Date(order.createdAt);
            const month = date.getMonth();
            if (!isNaN(month)) {
                monthlyData[month].total += order.total;
            }
        });

        // Top Collections
        const productCategoryMap: Record<string, string> = {};
        products.forEach((p: any) => {
            if (p.category?.name) {
                productCategoryMap[p.id] = p.category.name;
            }
        });

        const collectionCounts: Record<string, number> = {};
        let totalItemsSold = 0;

        orders.forEach((order: any) => {
            if (Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const pid = item.productId;
                    const catName = productCategoryMap[pid] || "Uncategorized";
                    collectionCounts[catName] = (collectionCounts[catName] || 0) + (item.quantity || 1);
                    totalItemsSold += (item.quantity || 1);
                });
            }
        });

        const collectionsArray = Object.entries(collectionCounts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalItemsSold > 0 ? Math.round((count / totalItemsSold) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Trends
        const salesTrend = calculateTrend(currentSales, previousSales);
        const ordersTrend = calculateTrend(currentOrders.length, previousOrders.length);
        
        const currentCust = new Set(currentOrders.map(o => o.email)).size;
        const previousCust = new Set(previousOrders.map(o => o.email)).size;
        const customersTrend = calculateTrend(currentCust, previousCust);

        const currentAOV = currentOrders.length > 0 ? (currentSales / currentOrders.length) : 0;
        const previousAOV = previousOrders.length > 0 ? (previousSales / previousOrders.length) : 0;
        const aovTrend = calculateTrend(currentAOV, previousAOV);

        setStats({
          totalSales,
          salesTrend,
          totalOrders: orders.length,
          ordersTrend,
          totalCustomers: new Set(orders.map((o: any) => o.email)).size,
          customersTrend,
          avgOrderValue: orders.length > 0 ? (totalSales / orders.length) : 0,
          aovTrend
        });
        
        setTopCollections(collectionsArray);
        setRecentOrders(orders.slice(0, 5));
        setGraphData(monthlyData);
      });
  }, []);

  const handleExport = () => {
    if (recentOrders.length === 0) return;
    
    const headers = ["Order ID", "Customer", "Status", "Total", "Date"];
    const csvContent = [
      headers.join(","),
      ...recentOrders.map((o: any) => [
        o.id,
        o.email,
        o.status,
        o.total,
        new Date(o.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `store_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function timeAgo(dateParam: string | Date) {
      if (!dateParam) return null;
      const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
      const today = new Date();
      const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
      const minutes = Math.round(seconds / 60);

      if (seconds < 5) return 'Just now';
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 90) return '1m ago';
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.round(hours / 24);
      return `${days}d ago`;
  }

  const cards = [
    { label: "Total Sales", value: stats.totalSales, prefix: "$", icon: DollarSign, trend: stats.salesTrend, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, trend: stats.ordersTrend, color: "text-blue-600 bg-blue-50" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, trend: stats.customersTrend, color: "text-purple-600 bg-purple-50" },
    { label: "Avg. Order Value", value: stats.avgOrderValue, prefix: "$", icon: TrendingUp, trend: stats.aovTrend, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Overview of your store's performance.</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-zinc-200 px-4 py-2 rounded-lg text-[13px] focus:outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 12 months</option>
          </select>
          <button 
            onClick={handleExport}
            className="bg-black text-white px-6 py-2 rounded-lg text-[13px] font-medium hover:bg-zinc-800 transition-all"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </div>
              <span className={`flex items-center text-[11px] font-bold ${card.trend.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                {card.trend}
                {card.trend.startsWith("+") ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </span>
            </div>
            <p className="text-zinc-500 text-[12px] uppercase tracking-wider font-semibold">{card.label}</p>
            <h3 className="text-2xl font-bold mt-1 text-zinc-900">
                <AnimatedNumber value={card.value} prefix={card.prefix} />
            </h3>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h3 className="font-bold mb-6">Revenue Overview</h3>
        <OverviewChart data={graphData} />
      </div>


      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden text-black font-sans">
          <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
            <h3 className="font-bold">Recent Orders</h3>
            <button className="text-zinc-400 hover:text-black transition-colors"><MoreHorizontal size={20} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-400 font-bold font-sans">
                <tr>
                  <th className="px-6 py-4 text-left">Order ID</th>
                  <th className="px-6 py-4 text-left">Customer</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-medium">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-600">{order.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-widest uppercase ${
                        order.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold">${order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[13px] text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products / Activity */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <h3 className="font-bold mb-6">Top Collection Performance</h3>
          <div className="space-y-6">
             {topCollections.length > 0 ? (
                topCollections.map((col, i) => (
                    <div key={col.name} className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                        <span className="text-zinc-600">{col.name}</span>
                        <span className="font-semibold">{col.percentage}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-black transition-all duration-1000`} 
                            style={{ width: `${col.percentage}%` }}
                        ></div>
                        </div>
                    </div>
                ))
             ) : (
                <div className="text-center py-8 text-zinc-400">
                    <p className="text-[12px]">No collection data available.</p>
                </div>
             )}
          </div>

          <div className="mt-12">
            <h3 className="font-bold mb-6">Live Activity</h3>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex gap-4 items-start animate-in slide-in-from-right-4 duration-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0 animate-pulse"></div>
                    <div>
                        <p className="text-[12px] font-medium text-zinc-800">New order placed by {order.email}</p>
                        <p className="text-[10px] text-zinc-400 uppercase mt-1">{timeAgo(order.createdAt)}</p>
                    </div>
                    </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-400">
                    <p className="text-[12px]">No recent activity detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
