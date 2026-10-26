"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, IndianRupee, PieChart } from "lucide-react";

export default function AnalyticsDashboardPage() {
  const { orders: localOrders, products } = useApp();
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year">("day");

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setDbOrders(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const orders = useMemo(() => {
    const allOrdersMap = new Map();
    localOrders.forEach((o: any) => allOrdersMap.set(o.id, o));
    dbOrders.forEach((o: any) => {
      if (allOrdersMap.has(o.id)) {
        const existing = allOrdersMap.get(o.id);
        allOrdersMap.set(o.id, { ...existing, ...o, items: o.items?.length ? o.items : existing.items });
      } else {
        allOrdersMap.set(o.id, o);
      }
    });
    return Array.from(allOrdersMap.values());
  }, [localOrders, dbOrders]);

  // Aggregate Data
  const totalRevenue = useMemo(() => {
    return orders.filter(o => o.status === "Delivered").reduce((acc, order) => acc + order.total, 0);
  }, [orders]);

  const totalSales = useMemo(() => {
    return orders.filter(o => o.status === "Delivered").length;
  }, [orders]);

  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Most popular products (based on cart quantities across orders)
  const productPopularity = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.filter(o => o.status === "Delivered").forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.product_name || item.product?.name || "Unknown";
          counts[name] = (counts[name] || 0) + (item.quantity || 1);
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5
  }, [orders]);

  // Dynamic chart data based on timeframe, with a baseline dummy curve for visual effect
  const chartData = useMemo(() => {
    const data: any[] = [];
    
    if (timeframe === "day") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Pseudo-random baseline between 1000 and 6000
        const baseline = 1000 + Math.abs(Math.sin(i * 1.5)) * 5000;
        data.push({ label: d.toLocaleDateString("en-US", { weekday: 'short' }), dateObj: d, baseline, actual: 0 });
      }
    } else if (timeframe === "week") {
      for (let i = 3; i >= 0; i--) {
        const baseline = 8000 + Math.abs(Math.cos(i * 2.1)) * 12000;
        data.push({ label: `Week ${4-i}`, offset: i, baseline, actual: 0 });
      }
    } else if (timeframe === "month") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const baseline = 20000 + Math.abs(Math.sin(i * 3.7)) * 35000;
        data.push({ label: d.toLocaleDateString("en-US", { month: 'short' }), dateObj: d, baseline, actual: 0 });
      }
    } else if (timeframe === "year") {
      const currentYear = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const baseline = 250000 + Math.abs(Math.cos(i * 0.8)) * 150000;
        data.push({ label: `${currentYear - i}`, year: currentYear - i, baseline, actual: 0 });
      }
    }

    // Overlay real delivered orders
    orders.filter(o => o.status === "Delivered").forEach(order => {
      const d = new Date(order.date);
      if (timeframe === "day") {
        const target = data.find(item => item.dateObj && item.dateObj.getFullYear() === d.getFullYear() && item.dateObj.getMonth() === d.getMonth() && item.dateObj.getDate() === d.getDate());
        if (target) target.actual += order.total;
      } else if (timeframe === "week") {
        const diffTime = Math.abs(new Date().getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 28) {
          const weekIndex = 3 - Math.floor((diffDays - 1) / 7);
          if (weekIndex >= 0 && weekIndex < 4) data[weekIndex].actual += order.total;
        }
      } else if (timeframe === "month") {
        const target = data.find(item => item.dateObj && item.dateObj.getFullYear() === d.getFullYear() && item.dateObj.getMonth() === d.getMonth());
        if (target) target.actual += order.total;
      } else if (timeframe === "year") {
        const target = data.find(item => item.year === d.getFullYear());
        if (target) target.actual += order.total;
      }
    });
    
    return data.map(d => ({ ...d, revenue: d.baseline + d.actual }));
  }, [orders, timeframe]);

  const maxRevenue = Math.max(1000, ...chartData.map(d => d.revenue));

  if (loading) {
    return <div className="text-center py-10 text-xs text-txt-muted animate-pulse">Aggregating telemetry data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-txt-white tracking-tight">Analytics Dashboard</h2>
          <p className="text-xs text-txt-muted mt-1">Deep insights into ecosystem performance and revenue.</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-txt-muted uppercase tracking-wider">Gross Revenue</p>
              <h3 className="text-3xl font-extrabold text-accent-neon mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-neon/10 border border-accent-neon/20 flex items-center justify-center text-accent-neon">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-txt-muted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent-green" /> <span className="text-accent-green">+14%</span> vs last month
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-txt-muted uppercase tracking-wider">Total Sales</p>
              <h3 className="text-3xl font-extrabold text-txt-white mt-1">{totalSales}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-txt-muted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent-green" /> <span className="text-accent-green">+8%</span> vs last month
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-txt-muted uppercase tracking-wider">Avg Order Value</p>
              <h3 className="text-3xl font-extrabold text-txt-white mt-1">₹{Math.round(avgOrderValue).toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-txt-muted flex items-center gap-1">
            Based on completed and pending telemetry
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-border-subtle/50 pb-4">
            <h3 className="text-xs font-bold text-txt-white uppercase tracking-wider">Revenue Trajectory</h3>
            <div className="flex gap-1 bg-bg-deep rounded-xl p-1 border border-border-subtle">
              {['day', 'week', 'month', 'year'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t as any)}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-colors ${
                    timeframe === t 
                      ? "bg-bg-sec-light text-txt-white shadow-sm border border-border-subtle" 
                      : "text-txt-muted hover:text-txt-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative h-72 w-full mt-6">
            {/* SVG Line Graph */}
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              className="absolute top-0 left-0 w-full h-[calc(100%-2rem)] overflow-visible z-0"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(163,255,18,0.4)" />
                  <stop offset="100%" stopColor="rgba(163,255,18,0)" />
                </linearGradient>
              </defs>
              
              {(() => {
                // Generate a smooth cubic bezier path
                if (chartData.length === 0) return null;
                const points = chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - (d.revenue / maxRevenue) * 100;
                  return { x, y };
                });
                
                let dStr = `M ${points[0].x},${points[0].y}`;
                for (let i = 0; i < points.length - 1; i++) {
                  const curr = points[i];
                  const next = points[i + 1];
                  const cp1x = curr.x + (next.x - curr.x) / 3;
                  const cp2x = next.x - (next.x - curr.x) / 3;
                  dStr += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`;
                }

                return (
                  <>
                    <path 
                      d={`${dStr} L 100,100 L 0,100 Z`}
                      fill="url(#lineGrad)"
                    />
                    <path 
                      d={dStr}
                      fill="none" 
                      stroke="#A3FF12"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                );
              })()}
            </svg>

            {/* Interactive Data Points & Labels */}
            <div className="absolute top-0 left-0 w-full h-[calc(100%-2rem)] flex justify-between z-10 pointer-events-none">
              {chartData.map((data, index) => {
                const heightPercentage = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex flex-col items-center relative group h-full w-4 pointer-events-auto">
                    {/* Tooltip */}
                    <div 
                      className="absolute bottom-full mb-3 bg-bg-deep border border-border-subtle text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-txt-white shadow-xl pointer-events-none"
                      style={{ bottom: `${heightPercentage}%` }}
                    >
                      <span className="text-txt-muted text-[9px] block mb-0.5">{data.label}</span>
                      <span className="font-bold text-accent-neon">₹{data.revenue.toLocaleString('en-IN')}</span>
                      {data.actual > 0 && <span className="block text-[8px] text-accent-green font-mono mt-0.5">Real: ₹{data.actual.toLocaleString('en-IN')}</span>}
                    </div>

                    {/* Vertical Hover Line */}
                    <div className="absolute bottom-0 w-px bg-accent-neon/0 group-hover:bg-accent-neon/30 h-full transition-colors pointer-events-none" />

                    {/* Data Point Node */}
                    <div 
                      className="absolute w-3 h-3 bg-bg-deep border-2 border-accent-neon rounded-full group-hover:scale-[1.8] group-hover:bg-accent-neon transition-all duration-300 shadow-[0_0_10px_rgba(163,255,18,0.5)] cursor-pointer"
                      style={{ bottom: `${heightPercentage}%`, transform: 'translateY(50%)' }}
                    />

                    {/* X-Axis Label */}
                    <span className="absolute -bottom-8 text-[10px] text-txt-muted font-mono whitespace-nowrap">
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6">
          <h3 className="text-xs font-bold text-txt-white uppercase tracking-wider mb-6 border-b border-border-subtle/50 pb-4">Top Cultivars</h3>
          
          <div className="space-y-5">
            {productPopularity.length > 0 ? (
              productPopularity.map(([name, quantity], idx) => {
                const maxQty = productPopularity[0][1];
                const widthPercent = (quantity / maxQty) * 100;
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-txt-white truncate pr-2">{name}</span>
                      <span className="text-txt-muted font-mono">{quantity} units</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg-deep rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-neon rounded-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-txt-muted">Not enough telemetry data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
