"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { LayoutDashboard, Leaf, ShoppingCart, PackageCheck, Truck } from "lucide-react";

export default function AdminDashboardPage() {
  const { products, orders } = useApp();
  
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Combine AppContext orders with DB orders if needed, or just fetch DB orders
    // Actually, AppContext has all orders synced! So we can use `orders` from Context!
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setDbOrders(data);
        }
      } catch (e) {
        console.error("Failed to fetch DB orders", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Use DB orders if available, otherwise fallback to AppContext orders for stats
  // Wait, if we use DB orders, it's more accurate for a real backend.
  // But AppContext orders includes local ones if the API failed. Let's merge them by ID.
  const allOrdersMap = new Map();
  
  orders.forEach(o => allOrdersMap.set(o.id, o));
  dbOrders.forEach(o => {
    // Ensure format matches the shape we expect
    allOrdersMap.set(o.id, {
      id: o.id,
      total: o.total,
      status: o.status,
      date: o.date
    });
  });

  const uniqueOrders = Array.from(allOrdersMap.values());

  const totalPlants = products.length;
  const totalOrders = uniqueOrders.length;
  const pendingOrders = uniqueOrders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  const readyOrders = uniqueOrders.filter(o => o.status === "Ready To Ship").length;
  const deliveredOrders = uniqueOrders.filter(o => o.status === "Delivered").length;

  const stats = [
    { label: "Total Plants", value: totalPlants, icon: Leaf, color: "text-accent-green" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-accent-neon" },
    { label: "Pending Orders", value: pendingOrders, icon: LayoutDashboard, color: "text-yellow-400" },
    { label: "Ready To Ship Orders", value: readyOrders, icon: PackageCheck, color: "text-orange-400" },
    { label: "Delivered Orders", value: deliveredOrders, icon: Truck, color: "text-green-400" },
  ];

  if (loading) {
    return <div className="text-center py-10 text-xs text-txt-muted animate-pulse">Syncing Telemetry...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-txt-white tracking-tight">Admin Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-txt-white">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-bg-deep border border-border-subtle flex items-center justify-center ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-bg-sec-dark/50 glass-card p-6 mt-8">
        <h3 className="text-xs font-bold text-txt-white uppercase tracking-wider mb-4 border-b border-border-subtle/50 pb-4">Recent Activity</h3>
        
        {uniqueOrders.length === 0 ? (
          <div className="text-xs text-txt-muted py-4">No recent activity detected.</div>
        ) : (
          <div className="space-y-4">
            {uniqueOrders.slice(0, 5).map((order: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-bg-deep border border-border-subtle/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 flex items-center justify-center text-accent-neon">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-txt-white">Order {order.id}</p>
                    <p className="text-[10px] text-txt-muted">Status: {order.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-accent-neon">₹{order.total?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-txt-muted">{new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
