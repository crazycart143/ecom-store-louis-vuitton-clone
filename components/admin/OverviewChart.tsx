"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";

const emptyData = [
  { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
  { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
  { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
  { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
];

export function OverviewChart({ data }: { data?: any[] }) {
  const chartData = data && data.length > 0 ? data : emptyData;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData}>
        <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis 
          dataKey="name" 
          stroke="#a1a1aa" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickMargin={10}
        />
        <YAxis 
          stroke="#a1a1aa" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `$${value}`} 
          tickMargin={10}
        />
        <Tooltip 
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            cursor={{ stroke: "#e4e4e7", strokeWidth: 1 }}
        />
        <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#000000" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
